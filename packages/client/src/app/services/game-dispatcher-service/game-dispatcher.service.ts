import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { LobbyInfo, PlayerData } from '@app/classes/communication/';
import { DictionarySummary } from '@app/classes/communication/dictionary-summary';
import { GameConfigData, InitializeGameData } from '@app/classes/communication/game-config';
import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
import { GameMode } from '@app/constants/game-mode';
import { GameType } from '@app/constants/game-type';
import { GameDispatcherController } from '@app/controllers/game-dispatcher-controller/game-dispatcher.controller';
import GameService from '@app/services/game-service/game.service';
import { GameViewEventManagerService } from '@app/services/game-view-event-manager-service/game-view-event-manager.service';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export default class GameDispatcherService implements OnDestroy {
    currentName: string = '';
    currentLobby: LobbyInfo | undefined = undefined;

    private gameCreationFailed$: Subject<HttpErrorResponse> = new Subject();
    private joinRequestEvent: Subject<string> = new Subject();
    private playerJoinedGroupEvent: Subject<PlayerData[]> = new Subject();
    private playerLeftGroupEvent: Subject<PlayerData[]> = new Subject();
    private canceledGameEvent: Subject<string> = new Subject();
    private lobbyFullEvent: Subject<void> = new Subject();
    private lobbiesUpdateEvent: Subject<LobbyInfo[]> = new Subject();
    private joinerRejectedEvent: Subject<string> = new Subject();
    private serviceDestroyed$: Subject<boolean> = new Subject();

    constructor(
        private gameDispatcherController: GameDispatcherController,
        public router: Router,
        private readonly gameService: GameService,
        private readonly gameViewEventManagerService: GameViewEventManagerService,
    ) {
        this.gameDispatcherController.subscribeToJoinRequestEvent(this.serviceDestroyed$, (opponentName: string) =>
            this.handleJoinRequest(opponentName),
        );
        this.gameDispatcherController.subscribeToPlayerJoinedGroupEvent(this.serviceDestroyed$, (players: PlayerData[]) =>
            this.handlePlayerJoinedRequest(players),
        );
        this.gameDispatcherController.subscribeToPlayerLeftGroupEvent(this.serviceDestroyed$, (players: PlayerData[]) =>
            this.handlePlayerLeftRequest(players),
        );
        this.gameDispatcherController.subscribeToLobbyFullEvent(this.serviceDestroyed$, () => this.handleLobbyFull());
        this.gameDispatcherController.subscribeToLobbyRequestValidEvent(this.serviceDestroyed$, async () =>
            this.router.navigateByUrl('join-waiting-room'),
        );
        this.gameDispatcherController.subscribeToCanceledGameEvent(this.serviceDestroyed$, (hostName: string) => this.handleCanceledGame(hostName));
        this.gameDispatcherController.subscribeToJoinerRejectedEvent(this.serviceDestroyed$, (hostName: string) =>
            this.handleJoinerRejected(hostName),
        );
        this.gameDispatcherController.subscribeToLobbiesUpdateEvent(this.serviceDestroyed$, (lobbies: LobbyInfo[]) =>
            this.handleLobbiesUpdate(lobbies),
        );
        this.gameDispatcherController.subscribeToInitializeGame(this.serviceDestroyed$, async (initializeValue: InitializeGameData | undefined) =>
            this.gameService.handleInitializeGame(initializeValue),
        );

        this.gameViewEventManagerService.subscribeToGameViewEvent('resetServices', this.serviceDestroyed$, () => this.resetServiceData());
    }

    ngOnDestroy(): void {
        this.serviceDestroyed$.next(true);
        this.serviceDestroyed$.complete();
    }

    getCurrentLobbyId(): string {
        return !this.currentLobby ? '' : this.currentLobby.lobbyId;
    }

    resetServiceData(): void {
        this.currentLobby = undefined;
        this.currentName = '';
    }

    handleJoinLobby(lobby: LobbyInfo, playerName: string): void {
        this.currentLobby = lobby;
        this.currentName = playerName;
        this.gameDispatcherController.handleLobbyJoinRequest(this.getCurrentLobbyId(), playerName);
    }

    handleLobbyListRequest(): void {
        this.gameDispatcherController.handleLobbiesListRequest();
    }

    handleCreateGame(playerName: string, gameParameters: FormGroup): void {
        const gameMode: GameMode = gameParameters.get('gameMode')?.value as GameMode;
        const gameConfig: GameConfigData = {
            playerName,
            playerId: this.gameDispatcherController.socketService.getId(),
            gameType: gameParameters.get('gameType')?.value as GameType,
            gameMode,
            maxRoundTime: gameParameters.get('timer')?.value as number,
            dictionary: gameParameters.get('dictionary')?.value as DictionarySummary,
        };
        if (gameMode === GameMode.Solo) {
            gameConfig.virtualPlayerName = gameParameters.get('virtualPlayerName')?.value as string;
            gameConfig.virtualPlayerLevel = gameParameters.get('level')?.value as VirtualPlayerLevel;
        }
        this.handleGameCreation(gameConfig);
    }

    handleRecreateGame(gameParameters?: FormGroup): void {
        if (!this.currentLobby) return;

        const gameConfig: GameConfigData = {
            playerName: this.currentLobby?.hostName,
            playerId: this.gameDispatcherController.socketService.getId(),
            gameType: this.currentLobby?.gameType,
            gameMode: this.isGameModeSolo(gameParameters) ? GameMode.Solo : GameMode.Multiplayer,
            maxRoundTime: this.currentLobby?.maxRoundTime,
            dictionary: this.currentLobby?.dictionary,
        };

        if (gameParameters && this.isGameModeSolo(gameParameters)) {
            gameConfig.virtualPlayerName = gameParameters.get('virtualPlayerName')?.value as string;
            gameConfig.virtualPlayerLevel = gameParameters.get('level')?.value as VirtualPlayerLevel;
        }
        this.handleGameCreation(gameConfig);
    }

    handleCancelGame(mustResetData: boolean = true): void {
        if (this.getCurrentLobbyId()) this.gameDispatcherController.handleCancelGame(this.getCurrentLobbyId());
        if (mustResetData) this.resetServiceData();
    }

    handleConfirmation(opponentName: string): void {
        if (this.getCurrentLobbyId())
            this.gameDispatcherController
                .handleConfirmationGameCreation(opponentName, this.getCurrentLobbyId())
                .subscribe({ next: undefined, error: (error: HttpErrorResponse) => this.gameCreationFailed$.next(error) });
    }

    handleStart(): void {
        if (this.getCurrentLobbyId())
            this.gameDispatcherController
                .handleStartGame(this.getCurrentLobbyId())
                .subscribe({ next: undefined, error: (error: HttpErrorResponse) => this.gameCreationFailed$.next(error) });
    }

    handleRejection(opponentName: string): void {
        if (this.getCurrentLobbyId()) this.gameDispatcherController.handleRejectionGameCreation(opponentName, this.getCurrentLobbyId());
    }

    subscribeToJoinRequestEvent(componentDestroyed$: Subject<boolean>, callback: (opponentName: string) => void): void {
        this.joinRequestEvent.pipe(takeUntil(componentDestroyed$)).subscribe(callback);
    }

    subscribeToPlayerJoinedGroupEvent(componentDestroyed$: Subject<boolean>, callback: (players: PlayerData[]) => void): void {
        this.playerJoinedGroupEvent.pipe(takeUntil(componentDestroyed$)).subscribe(callback);
    }

    subscribeToPlayerLeftGroupEvent(componentDestroyed$: Subject<boolean>, callback: (players: PlayerData[]) => void): void {
        this.playerLeftGroupEvent.pipe(takeUntil(componentDestroyed$)).subscribe(callback);
    }

    subscribeToCanceledGameEvent(componentDestroyed$: Subject<boolean>, callback: (hostName: string) => void): void {
        this.canceledGameEvent.pipe(takeUntil(componentDestroyed$)).subscribe(callback);
    }

    subscribeToLobbyFullEvent(componentDestroyed$: Subject<boolean>, callback: () => void): void {
        this.lobbyFullEvent.pipe(takeUntil(componentDestroyed$)).subscribe(callback);
    }

    subscribeToLobbiesUpdateEvent(componentDestroyed$: Subject<boolean>, callback: (lobbies: LobbyInfo[]) => void): void {
        this.lobbiesUpdateEvent.pipe(takeUntil(componentDestroyed$)).subscribe(callback);
    }

    subscribeToJoinerRejectedEvent(componentDestroyed$: Subject<boolean>, callback: (hostName: string) => void): void {
        this.joinerRejectedEvent.pipe(takeUntil(componentDestroyed$)).subscribe(callback);
    }

    observeGameCreationFailed(): Observable<HttpErrorResponse> {
        return this.gameCreationFailed$.asObservable();
    }

    private handleGameCreation(gameConfig: GameConfigData): void {
        this.gameDispatcherController.handleGameCreation(gameConfig).subscribe(
            (response) => {
                this.currentLobby = response.lobbyData;
                if (this.currentLobby && this.currentLobby.gameMode === GameMode.Multiplayer) {
                    this.router.navigateByUrl('waiting-room');
                }
            },
            (error: HttpErrorResponse) => {
                this.gameCreationFailed$.next(error);
            },
        );
    }

    private isGameModeSolo(gameParameters?: FormGroup): boolean {
        return (gameParameters && gameParameters.get('gameMode')?.value === GameMode.Solo) ?? false;
    }

    private handleJoinRequest(opponentName: string): void {
        this.joinRequestEvent.next(opponentName);
    }

    private handlePlayerJoinedRequest(players: PlayerData[]): void {
        this.playerJoinedGroupEvent.next(players);
    }

    private handlePlayerLeftRequest(players: PlayerData[]): void {
        this.playerLeftGroupEvent.next(players);
    }

    private handleJoinerRejected(hostName: string): void {
        this.joinerRejectedEvent.next(hostName);
        this.resetServiceData();
    }

    private handleLobbiesUpdate(lobbies: LobbyInfo[]): void {
        this.lobbiesUpdateEvent.next(lobbies);
    }

    private handleLobbyFull(): void {
        this.lobbyFullEvent.next();
        this.resetServiceData();
    }

    private handleCanceledGame(hostName: string): void {
        this.canceledGameEvent.next(hostName);
        this.resetServiceData();
    }
}
