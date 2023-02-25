import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { PlayerData } from '@app/classes/communication/';
import { GameConfigData, InitializeGameData } from '@app/classes/communication/game-config';
import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
import { GameDispatcherController } from '@app/controllers/game-dispatcher-controller/game-dispatcher.controller';
import GameService from '@app/services/game-service/game.service';
import { GameViewEventManagerService } from '@app/services/game-view-event-manager-service/game-view-event-manager.service';
import GroupInfo from '@common/models/group-info';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export default class GameDispatcherService implements OnDestroy {
    currentName: string = '';
    currentGroup: GroupInfo | undefined = undefined;

    private gameCreationFailed$: Subject<HttpErrorResponse> = new Subject();
    private joinRequestEvent: Subject<string> = new Subject();
    private playerJoinedGroupEvent: Subject<PlayerData[]> = new Subject();
    private playerLeftGroupEvent: Subject<PlayerData[]> = new Subject();
    private canceledGameEvent: Subject<string> = new Subject();
    private groupFullEvent: Subject<void> = new Subject();
    private groupsUpdateEvent: Subject<GroupInfo[]> = new Subject();
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
        this.gameDispatcherController.subscribeToGroupFullEvent(this.serviceDestroyed$, () => this.handleGroupFull());
        this.gameDispatcherController.subscribeToGroupRequestValidEvent(this.serviceDestroyed$, async () =>
            this.router.navigateByUrl('join-waiting-room'),
        );
        this.gameDispatcherController.subscribeToCanceledGameEvent(this.serviceDestroyed$, (hostName: string) => this.handleCanceledGame(hostName));
        this.gameDispatcherController.subscribeToJoinerRejectedEvent(this.serviceDestroyed$, (hostName: string) =>
            this.handleJoinerRejected(hostName),
        );
        this.gameDispatcherController.subscribeToGroupsUpdateEvent(this.serviceDestroyed$, (groups: GroupInfo[]) => this.handleGroupsUpdate(groups));
        this.gameDispatcherController.subscribeToInitializeGame(this.serviceDestroyed$, async (initializeValue: InitializeGameData | undefined) =>
            this.gameService.handleInitializeGame(initializeValue),
        );

        this.gameViewEventManagerService.subscribeToGameViewEvent('resetServices', this.serviceDestroyed$, () => this.resetServiceData());
    }

    ngOnDestroy(): void {
        this.serviceDestroyed$.next(true);
        this.serviceDestroyed$.complete();
    }

    getCurrentGroupId(): string {
        return !this.currentGroup ? '' : this.currentGroup.groupId;
    }

    resetServiceData(): void {
        this.currentGroup = undefined;
        this.currentName = '';
    }

    handleJoinGroup(group: GroupInfo, playerName: string): void {
        this.currentGroup = group;
        this.currentName = playerName;
        this.gameDispatcherController.handleGroupJoinRequest(this.getCurrentGroupId(), playerName);
    }

    handleGroupListRequest(): void {
        this.gameDispatcherController.handleGroupsListRequest();
    }

    handleCreateGame(playerName: string, gameParameters: FormGroup): void {
        const gameConfig: GameConfigData = {
            playerName,
            playerId: this.gameDispatcherController.socketService.getId(),
            maxRoundTime: gameParameters.get('timer')?.value as number,
            virtualPlayerLevel: gameParameters.get('level')?.value as VirtualPlayerLevel,
        };
        this.handleGameCreation(gameConfig);
    }

    handleRecreateGame(gameParameters?: FormGroup): void {
        if (!this.currentGroup) return;

        const gameConfig: GameConfigData = {
            playerName: this.currentGroup?.hostName,
            playerId: this.gameDispatcherController.socketService.getId(),
            maxRoundTime: this.currentGroup?.maxRoundTime,
        };

        if (gameParameters) {
            gameConfig.virtualPlayerName = gameParameters.get('virtualPlayerName')?.value as string;
            gameConfig.virtualPlayerLevel = gameParameters.get('level')?.value as VirtualPlayerLevel;
        }
        this.handleGameCreation(gameConfig);
    }

    handleCancelGame(mustResetData: boolean = true): void {
        if (this.getCurrentGroupId()) this.gameDispatcherController.handleCancelGame(this.getCurrentGroupId());
        if (mustResetData) this.resetServiceData();
    }

    handleConfirmation(opponentName: string): void {
        if (this.getCurrentGroupId())
            this.gameDispatcherController
                .handleConfirmationGameCreation(opponentName, this.getCurrentGroupId())
                .subscribe({ next: undefined, error: (error: HttpErrorResponse) => this.gameCreationFailed$.next(error) });
    }

    handleStart(): void {
        if (this.getCurrentGroupId())
            this.gameDispatcherController
                .handleStartGame(this.getCurrentGroupId())
                .subscribe({ next: undefined, error: (error: HttpErrorResponse) => this.gameCreationFailed$.next(error) });
    }

    handleRejection(opponentName: string): void {
        if (this.getCurrentGroupId()) this.gameDispatcherController.handleRejectionGameCreation(opponentName, this.getCurrentGroupId());
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

    subscribeToGroupFullEvent(componentDestroyed$: Subject<boolean>, callback: () => void): void {
        this.groupFullEvent.pipe(takeUntil(componentDestroyed$)).subscribe(callback);
    }

    subscribeToGroupsUpdateEvent(componentDestroyed$: Subject<boolean>, callback: (groups: GroupInfo[]) => void): void {
        this.groupsUpdateEvent.pipe(takeUntil(componentDestroyed$)).subscribe(callback);
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
                this.currentGroup = response.group;
                if (this.currentGroup) {
                    this.router.navigateByUrl('waiting-room');
                }
            },
            (error: HttpErrorResponse) => {
                this.gameCreationFailed$.next(error);
            },
        );
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

    private handleGroupsUpdate(groups: GroupInfo[]): void {
        this.groupsUpdateEvent.next(groups);
    }

    private handleGroupFull(): void {
        this.groupFullEvent.next();
        this.resetServiceData();
    }

    private handleCanceledGame(hostName: string): void {
        this.canceledGameEvent.next(hostName);
        this.resetServiceData();
    }
}
