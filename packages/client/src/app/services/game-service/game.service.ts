import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { GameUpdateData, PlayerData } from '@app/classes/communication/';
import { InitializeGameData, StartGameData } from '@app/classes/communication/game-config';
import { Message } from '@app/classes/communication/message';
import { Player } from '@app/classes/player';
import { PlayerContainer } from '@app/classes/player/player-container';
import { Round } from '@app/classes/round/round';
import { TileReserveData } from '@app/classes/tile/tile.types';
import { SYSTEM_ERROR_ID } from '@app/constants/game-constants';
import { ROUTE_GAME, ROUTE_GAME_OBSERVER } from '@app/constants/routes-constants';
import { GamePlayController } from '@app/controllers/game-play-controller/game-play.controller';
import BoardService from '@app/services/board-service/board.service';
import { GameViewEventManagerService } from '@app/services/game-view-event-manager-service/game-view-event-manager.service';
import RoundManagerService from '@app/services/round-manager-service/round-manager.service';
import { IResetServiceData } from '@app/utils/i-reset-service-data/i-reset-service-data';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TilePlacementService } from '@app/services/tile-placement-service/tile-placement.service';
import { ActionService } from '@app/services/action-service/action.service';
import { ActionType } from '@app/classes/actions/action-data';

@Injectable({
    providedIn: 'root',
})
export default class GameService implements OnDestroy, IResetServiceData {
    tileReserve: TileReserveData[];

    isGameSetUp: boolean;
    isGameOver: boolean;
    isObserver: boolean | undefined;

    private gameId: string;
    private playerContainer?: PlayerContainer;
    private serviceDestroyed$: Subject<boolean>;

    constructor(
        private router: Router,
        private boardService: BoardService,
        private roundManager: RoundManagerService,
        private gameController: GamePlayController,
        private gameViewEventManagerService: GameViewEventManagerService,
        private tilePlacementService: TilePlacementService,
        private actionService: ActionService,
    ) {
        this.serviceDestroyed$ = new Subject();
        this.gameController
            .observeNewMessage()
            .pipe(takeUntil(this.serviceDestroyed$))
            .subscribe((newMessage) => {
                if (newMessage) this.handleNewMessage(newMessage);
            });
        this.gameController
            .observeGameUpdate()
            .pipe(takeUntil(this.serviceDestroyed$))
            .subscribe((newData) => this.handleGameUpdate(newData));

        this.gameViewEventManagerService.subscribeToGameViewEvent('resetServices', this.serviceDestroyed$, () => this.resetServiceData());
    }

    ngOnDestroy(): void {
        this.serviceDestroyed$.next(true);
        this.serviceDestroyed$.complete();
    }

    async handleInitializeGame(initializeGameData: InitializeGameData | undefined, isObserver: boolean): Promise<void> {
        if (!initializeGameData) return;
        await this.initializeGame(initializeGameData.localPlayerId, initializeGameData.startGameData, isObserver);
        this.gameViewEventManagerService.emitGameViewEvent('gameInitialized', initializeGameData);
    }

    isLocalPlayerPlaying(): boolean {
        if (!this.playerContainer) return false;
        return this.getPlayingPlayerId() === this.playerContainer.getLocalPlayerId();
    }

    getGameId(): string {
        return this.gameId;
    }

    resetGameId(): void {
        this.gameId = '';
        this.isObserver = undefined;
    }

    getPlayerByNumber(playerNumber: number): Player | undefined {
        if (!this.playerContainer) return undefined;
        return this.playerContainer.getPlayer(playerNumber);
    }

    getLocalPlayer(): Player | undefined {
        if (!this.playerContainer) return undefined;
        return this.playerContainer.getLocalPlayer();
    }

    getLocalPlayerId(): string | undefined {
        if (!this.playerContainer) return undefined;
        return this.playerContainer.getLocalPlayerId();
    }

    setLocalPlayer(playerNumber: number): void {
        if (!this.playerContainer) return;
        this.playerContainer.setLocalPlayer(playerNumber);
        this.gameViewEventManagerService.emitGameViewEvent('tileRackUpdate', this.getLocalPlayerId());
    }

    getTotalNumberOfTilesLeft(): number {
        if (!this.tileReserve) return 0;
        return this.tileReserve.reduce((prev, { amount }) => prev + amount, 0);
    }

    resetServiceData(): void {
        this.tileReserve = [];
        this.isGameOver = false;
        this.gameId = '';
        this.playerContainer = undefined;
        this.isObserver = undefined;
        this.tilePlacementService.resetTiles();
    }

    playTilesOnBoard(): void {
        if (!this.tilePlacementService.isPlacementValid) return;
        const payload = this.tilePlacementService.createPlaceActionPayload();

        if (!payload) return;

        this.actionService.sendAction(
            this.gameId,
            this.actionService.createActionData(ActionType.PLACE, { ...payload, playerId: this.getLocalPlayerId() }),
        );
    }

    private getPlayingPlayerId(): string {
        return this.roundManager.getActivePlayer().id;
    }

    private async initializeGame(localPlayerId: string, startGameData: StartGameData, isObserver: boolean): Promise<void> {
        this.isObserver = isObserver;
        this.gameId = startGameData.gameId;
        this.playerContainer = new PlayerContainer(isObserver ? startGameData.player1.id : localPlayerId, isObserver).initializePlayers([
            startGameData.player1,
            startGameData.player2,
            startGameData.player3,
            startGameData.player4,
        ]);
        this.tileReserve = startGameData.tileReserve;
        this.tilePlacementService.resetTiles();

        this.roundManager.initialize(localPlayerId, startGameData);
        this.boardService.initializeBoard(startGameData.board);

        this.isGameSetUp = true;
        this.isGameOver = false;

        await this.handleReRouteOrReconnect(startGameData, isObserver);
    }

    private async handleReRouteOrReconnect(startGameData: StartGameData, isObserver: boolean): Promise<void> {
        if (this.router.url !== ROUTE_GAME && this.router.url !== ROUTE_GAME_OBSERVER) {
            this.roundManager.initializeEvents();
            this.roundManager.startRound();
            if (isObserver) {
                await this.router.navigateByUrl(ROUTE_GAME_OBSERVER);
            } else {
                await this.router.navigateByUrl(ROUTE_GAME);
            }
        }
    }

    private handleGameUpdate(gameUpdateData: GameUpdateData): void {
        if (gameUpdateData.isGameOver) {
            this.handleGameOver(gameUpdateData.winners ?? []);
        }
        if (gameUpdateData.player1) {
            this.handleUpdatePlayerData(gameUpdateData.player1);
        }
        if (gameUpdateData.player2) {
            this.handleUpdatePlayerData(gameUpdateData.player2);
        }
        if (gameUpdateData.player3) {
            this.handleUpdatePlayerData(gameUpdateData.player3);
        }
        if (gameUpdateData.player4) {
            this.handleUpdatePlayerData(gameUpdateData.player4);
        }
        if (gameUpdateData.board) {
            this.boardService.updateBoard(gameUpdateData.board);
        }
        if (gameUpdateData.round) {
            const round: Round = this.roundManager.convertRoundDataToRound(gameUpdateData.round);
            this.roundManager.updateRound(round);
        }
        if (gameUpdateData.tileReserve) {
            this.handleTileReserveUpdate(gameUpdateData.tileReserve);
        }
    }

    private handleUpdatePlayerData(playerData: PlayerData): void {
        if (this.playerContainer) {
            this.playerContainer.updatePlayersData(playerData);
        }
        this.gameViewEventManagerService.emitGameViewEvent('tileRackUpdate', playerData.id);
    }

    private handleTileReserveUpdate(tileReserve: TileReserveData[]): void {
        this.tileReserve = [...tileReserve];
    }

    private handleNewMessage(newMessage: Message): void {
        this.gameViewEventManagerService.emitGameViewEvent('newMessage', newMessage);
        if (newMessage.senderId === SYSTEM_ERROR_ID) {
            this.tilePlacementService.resetTiles();
        }
    }

    private handleGameOver(winnerNames: string[]): void {
        this.isGameOver = true;
        this.roundManager.resetTimerData();
        this.gameViewEventManagerService.emitGameViewEvent('endOfGame', winnerNames);
    }
}
