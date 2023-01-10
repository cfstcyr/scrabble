import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { GameUpdateData, PlayerData } from '@app/classes/communication/';
import { InitializeGameData, StartGameData } from '@app/classes/communication/game-config';
import { Message } from '@app/classes/communication/message';
import { Player } from '@app/classes/player';
import { PlayerContainer } from '@app/classes/player/player-container';
import { Round } from '@app/classes/round/round';
import { Square } from '@app/classes/square';
import { TileReserveData } from '@app/classes/tile/tile.types';
import { SYSTEM_ERROR_ID } from '@app/constants/game-constants';
import { GameType } from '@app/constants/game-type';
import { GamePlayController } from '@app/controllers/game-play-controller/game-play.controller';
import BoardService from '@app/services/board-service/board.service';
import { GameViewEventManagerService } from '@app/services/game-view-event-manager-service/game-view-event-manager.service';
import { ObjectivesManagerService } from '@app/services/objectives-manager-service/objectives-manager.service';
import RoundManagerService from '@app/services/round-manager-service/round-manager.service';
import { IResetServiceData } from '@app/utils/i-reset-service-data/i-reset-service-data';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export default class GameService implements OnDestroy, IResetServiceData {
    tileReserve: TileReserveData[];

    isGameSetUp: boolean;
    isGameOver: boolean;

    private gameId: string;
    private gameType: GameType;
    private playerContainer?: PlayerContainer;
    private serviceDestroyed$: Subject<boolean>;

    constructor(
        private router: Router,
        private boardService: BoardService,
        private roundManager: RoundManagerService,
        private objectiveManager: ObjectivesManagerService,
        private gameController: GamePlayController,
        private gameViewEventManagerService: GameViewEventManagerService,
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

    async handleInitializeGame(initializeGameData: InitializeGameData | undefined): Promise<void> {
        if (!initializeGameData) return;
        await this.initializeGame(initializeGameData.localPlayerId, initializeGameData.startGameData);
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

    getTotalNumberOfTilesLeft(): number {
        if (!this.tileReserve) return 0;
        return this.tileReserve.reduce((prev, { amount }) => prev + amount, 0);
    }

    getGameType(): GameType {
        return this.gameType;
    }

    resetServiceData(): void {
        this.tileReserve = [];
        this.isGameOver = false;
        this.gameId = '';
        this.gameType = GameType.Classic;
        this.playerContainer = undefined;
        this.gameViewEventManagerService.emitGameViewEvent('resetUsedTiles');
    }

    private getPlayingPlayerId(): string {
        return this.roundManager.getActivePlayer().id;
    }

    private isLocalPlayerPlayer1(): boolean {
        if (!this.playerContainer) return false;
        return this.playerContainer.getLocalPlayerId() === this.playerContainer.getPlayer(1).id;
    }

    private async initializeGame(localPlayerId: string, startGameData: StartGameData): Promise<void> {
        this.gameId = startGameData.gameId;
        this.gameType = startGameData.gameType;
        this.playerContainer = new PlayerContainer(localPlayerId).initializePlayers(startGameData.player1, startGameData.player2);
        this.tileReserve = startGameData.tileReserve;
        this.gameViewEventManagerService.emitGameViewEvent('resetUsedTiles');

        this.roundManager.initialize(localPlayerId, startGameData);
        this.boardService.initializeBoard(startGameData.board);
        this.objectiveManager.initialize(startGameData, this.isLocalPlayerPlayer1());

        this.isGameSetUp = true;
        this.isGameOver = false;

        await this.handleReRouteOrReconnect(startGameData);
    }

    private async handleReRouteOrReconnect(startGameData: StartGameData): Promise<void> {
        if (this.router.url !== '/game') {
            this.roundManager.initializeEvents();
            this.roundManager.startRound();
            await this.router.navigateByUrl('game');
        } else {
            this.reconnectReinitialize(startGameData);
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
        if (gameUpdateData.gameObjective) {
            this.objectiveManager.updateObjectives(gameUpdateData.gameObjective);
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
            this.gameViewEventManagerService.emitGameViewEvent('resetUsedTiles');
        }
    }

    private handleGameOver(winnerNames: string[]): void {
        this.isGameOver = true;
        this.roundManager.resetTimerData();
        this.gameViewEventManagerService.emitGameViewEvent('endOfGame', winnerNames);
    }

    private reconnectReinitialize(startGameData: StartGameData): void {
        if (this.playerContainer) {
            this.playerContainer.updatePlayersData(startGameData.player1, startGameData.player2);
        }
        this.gameViewEventManagerService.emitGameViewEvent('reRender');
        this.gameViewEventManagerService.emitGameViewEvent('tileRackUpdate', this.getLocalPlayerId());
        this.boardService.updateBoard(([] as Square[]).concat(...startGameData.board));
        this.roundManager.continueRound(this.roundManager.currentRound);
    }
}
