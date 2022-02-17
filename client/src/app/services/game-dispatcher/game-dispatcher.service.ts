import { Injectable, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { LobbyInfo } from '@app/classes/communication/';
import { GameConfigData } from '@app/classes/communication/game-config';
import { GameType } from '@app/classes/game-type';
import { GameDispatcherController } from '@app/controllers/game-dispatcher-controller/game-dispatcher.controller';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export default class GameDispatcherService implements OnDestroy {
    serviceDestroyed$: Subject<boolean> = new Subject();
    gameId: string;
    currentLobby: LobbyInfo | undefined;
    currentName: string;
    joinRequestEvent: Subject<string> = new Subject();
    lobbiesUpdateEvent: Subject<LobbyInfo[]> = new Subject();
    lobbyFullEvent: Subject<void> = new Subject();
    canceledGameEvent: Subject<string> = new Subject();
    joinerLeaveGameEvent: Subject<string> = new Subject();
    joinerRejectedEvent: Subject<string> = new Subject();

    constructor(private gameDispatcherController: GameDispatcherController, public router: Router) {
        this.gameDispatcherController.createGameEvent.pipe(takeUntil(this.serviceDestroyed$)).subscribe((gameId: string) => {
            this.gameId = gameId;
        });
        this.gameDispatcherController.subscribeToJoinRequestEvent(this.serviceDestroyed$, (opponentName: string) =>
            this.handleJoinRequest(opponentName),
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
    }

    ngOnDestroy(): void {
        this.serviceDestroyed$.next(true);
        this.serviceDestroyed$.complete();
    }

    resetServiceData(): void {
        this.currentLobby = undefined;
        this.currentName = '';
        this.gameId = '';
    }

    handleJoinLobby(lobby: LobbyInfo, playerName: string): void {
        this.currentLobby = lobby;
        this.currentName = playerName;
        this.gameId = lobby.lobbyId;
        this.gameDispatcherController.handleLobbyJoinRequest(this.gameId, playerName);
    }

    handleLobbyListRequest(): void {
        this.gameDispatcherController.handleLobbiesListRequest();
    }

    handleCreateGame(playerName: string, gameParameters: FormGroup): void {
        const gameConfig: GameConfigData = {
            playerName,
            playerId: this.gameDispatcherController.socketService.getId(),
            gameType: gameParameters.get('gameType')?.value as GameType,
            maxRoundTime: gameParameters.get('timer')?.value as number,
            dictionary: gameParameters.get('dictionary')?.value as string,
        };
        this.gameDispatcherController.handleMultiplayerGameCreation(gameConfig);
    }

    handleCancelGame(): void {
        if (this.gameId) this.gameDispatcherController.handleCancelGame(this.gameId);
        this.resetServiceData();
    }

    handleConfirmation(opponentName: string): void {
        if (this.gameId) this.gameDispatcherController.handleConfirmationGameCreation(opponentName, this.gameId);
    }

    handleRejection(opponentName: string): void {
        if (this.gameId) this.gameDispatcherController.handleRejectionGameCreation(opponentName, this.gameId);
    }

    handleJoinRequest(opponentName: string): void {
        this.joinRequestEvent.next(opponentName);
    }

    handleJoinerRejected(hostName: string): void {
        this.joinerRejectedEvent.next(hostName);
        this.resetServiceData();
    }

    handleLobbiesUpdate(lobbies: LobbyInfo[]): void {
        this.lobbiesUpdateEvent.next(lobbies);
    }

    handleLobbyFull(): void {
        this.lobbyFullEvent.next();
        this.resetServiceData();
    }

    handleCanceledGame(hostName: string): void {
        this.canceledGameEvent.next(hostName);
        this.resetServiceData();
    }

    handleJoinerLeaveGame(leaverName: string): void {
        this.joinerLeaveGameEvent.next(leaverName);
    }
}
