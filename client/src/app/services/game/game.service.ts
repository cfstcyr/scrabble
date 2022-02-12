import { EventEmitter, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { GameUpdateData, PlayerData } from '@app/classes/communication/';
import { StartMultiplayerGameData } from '@app/classes/communication/game-config';
import { Message } from '@app/classes/communication/message';
import { GameType } from '@app/classes/game-type';
import { AbstractPlayer, Player } from '@app/classes/player';
import { TileReserveData } from '@app/classes/tile/tile.types';
import { SYSTEM_ID } from '@app/constants/game';
import { GamePlayController } from '@app/controllers/game-play-controller/game-play.controller';
import BoardService from '@app/services/board/board.service';
import RoundManagerService from '@app/services/round-manager/round-manager.service';
import { MISSING_PLAYER_DATA_TO_INITIALIZE } from '@app/constants/services-errors';

export type UpdateTileReserveEventArgs = Required<Pick<GameUpdateData, 'tileReserve' | 'tileReserveTotal'>>;

@Injectable({
    providedIn: 'root',
})
export default class GameService {
    // highScoreService: HighScoreService;
    // gameHistoryService: GameHistoryService;
    // objectiveManagerService: ObjectiveManagerService;
    player1: AbstractPlayer;
    player2: AbstractPlayer;
    gameType: GameType;
    dictionnaryName: string;
    gameUpdateValue = new BehaviorSubject<GameUpdateData>({});
    newMessageValue = new BehaviorSubject<Message>({
        content: 'Début de la partie',
        senderId: SYSTEM_ID,
    });
    tileReserve: TileReserveData[];
    tileReserveTotal: number;
    updateTileRackEvent: EventEmitter<void>;
    updateTileReserveEvent: EventEmitter<UpdateTileReserveEventArgs>;

    private gameId: string;
    private localPlayerId: string;

    constructor(
        private router: Router,
        private boardService: BoardService,
        private roundManager: RoundManagerService,
        private gameController: GamePlayController,
    ) {
        this.roundManager.gameId = this.gameId;
        this.updateTileRackEvent = new EventEmitter();
        this.gameController.newMessageValue.subscribe((newMessage) => this.handleNewMessage(newMessage));
        this.gameController.gameUpdateValue.subscribe((newData) => this.handleGameUpdate(newData));
        this.updateTileReserveEvent = new EventEmitter();
    }

    async initializeMultiplayerGame(localPlayerId: string, startGameData: StartMultiplayerGameData) {
        this.gameId = startGameData.gameId;
        this.localPlayerId = localPlayerId;
        this.player1 = this.initializePlayer(startGameData.player1);
        this.player2 = this.initializePlayer(startGameData.player2);
        this.gameType = startGameData.gameType;
        this.dictionnaryName = startGameData.dictionary;
        this.roundManager.gameId = startGameData.gameId;
        this.roundManager.localPlayerId = this.localPlayerId;
        this.roundManager.maxRoundTime = startGameData.maxRoundTime;
        this.roundManager.currentRound = startGameData.round;
        this.tileReserve = startGameData.tileReserve;
        this.tileReserveTotal = startGameData.tileReserveTotal;
        this.boardService.initializeBoard(startGameData.board);
        this.roundManager.startRound();
        await this.router.navigateByUrl('game');
    }

    initializePlayer(playerData: PlayerData): AbstractPlayer {
        if (!playerData.id || !playerData.name || !playerData.tiles) throw new Error(MISSING_PLAYER_DATA_TO_INITIALIZE);
        return new Player(playerData.id, playerData.name, playerData.tiles);
    }

    handleGameUpdate(gameUpdateData: GameUpdateData): void {
        if (gameUpdateData.player1) {
            this.player1.updatePlayerData(gameUpdateData.player1);
            this.updateTileRackEvent.emit();
        }
        if (gameUpdateData.player2) {
            this.player2.updatePlayerData(gameUpdateData.player2);
            this.updateTileRackEvent.emit();
        }
        if (gameUpdateData.board) {
            this.boardService.updateBoard(gameUpdateData.board);
        }
        if (gameUpdateData.round) {
            this.roundManager.updateRound(gameUpdateData.round);
        }
        if (gameUpdateData.tileReserve && gameUpdateData.tileReserveTotal) {
            this.tileReserve = gameUpdateData.tileReserve;
            this.tileReserveTotal = gameUpdateData.tileReserveTotal;
            this.updateTileReserveEvent.emit({ tileReserve: gameUpdateData.tileReserve, tileReserveTotal: gameUpdateData.tileReserveTotal });
        }
        if (gameUpdateData.isGameOver) {
            this.gameOver();
        }
    }

    updateGameUpdateData(newData: GameUpdateData) {
        this.gameUpdateValue.next(newData);
    }

    handleNewMessage(newMessage: Message): void {
        this.newMessageValue.next(newMessage);
    }

    isLocalPlayerPlaying(): boolean {
        if (!this.localPlayerId || !this.roundManager.getActivePlayer()) return false;
        return this.localPlayerId === this.roundManager.getActivePlayer().id;
    }

    getGameId(): string {
        return this.gameId;
    }

    getLocalPlayer(): AbstractPlayer | undefined {
        if (!this.localPlayerId) return undefined;
        return this.player1.id === this.localPlayerId ? this.player1 : this.player2;
    }

    getLocalPlayerId(): string | undefined {
        if (!this.localPlayerId) return undefined;
        return this.player1.id === this.localPlayerId ? this.player1.id : this.player2.id;
    }

    gameOver(): boolean {
        throw new Error('Method not implemented.');
    }

    sendScores(): void {
        throw new Error('Method not implemented.');
    }

    // TODO: Maybe rename to sendGame or sendFinishedGame
    sendGameHistory(): void {
        throw new Error('Method not implemented.');
    }
}
