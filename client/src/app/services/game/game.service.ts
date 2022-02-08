import { EventEmitter, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { StartMultiplayerGameData } from '@app/classes/communication/game-config';
import { GameUpdateData } from '@app/classes/communication/game-update-data';
import { PlayerData } from '@app/classes/communication/player-data';
import { GameType } from '@app/classes/game-type';
import { IPlayer, Player } from '@app/classes/player';
import { GamePlayController } from '@app/controllers/game-play-controller/game-play.controller';
import { BoardService } from '@app/services/';
import RoundManagerService from '@app/services/round-manager/round-manager.service';
import * as GAME_ERRORS from './game.service.error';

@Injectable({
    providedIn: 'root',
})
export default class GameService {
    // highScoreService: HighScoreService;
    // gameHistoryService: GameHistoryService;
    // objectiveManagerService: ObjectiveManagerService;
    player1: IPlayer;
    player2: IPlayer;
    gameType: GameType;
    dictionnaryName: string;
    startGameEvent: EventEmitter<void> = new EventEmitter();
    private gameId: string;
    private localPlayerId: string;

    constructor(
        private router: Router,
        private boardService: BoardService,
        private roundManager: RoundManagerService,
        private gameplayController: GamePlayController,
    ) {
        this.roundManager.gameId = this.gameId;
        this.gameplayController.gameUpdateData.subscribe((data: GameUpdateData) => this.handleGameUpdate(data));
    }

    async initializeMultiplayerGame(localPlayerId: string, startGameData: StartMultiplayerGameData) {
        await this.router.navigateByUrl('game');
        this.gameId = startGameData.gameId;
        this.localPlayerId = localPlayerId;
        this.player1 = this.initializePlayer(startGameData.player1);
        this.player2 = this.initializePlayer(startGameData.player2);
        this.gameType = startGameData.gameType;
        this.dictionnaryName = startGameData.dictionary;
        this.roundManager.gameId = startGameData.gameId;
        this.roundManager.maxRoundTime = startGameData.maxRoundTime;
        this.roundManager.currentRound = startGameData.round;
        this.boardService.initializeBoard(startGameData.board);
        this.roundManager.startRound();
        this.startGameEvent.emit();
    }

    initializePlayer(playerData: PlayerData): IPlayer {
        if (!playerData.id || !playerData.name || !playerData.tiles) throw new Error(GAME_ERRORS.MSSING_PLAYER_DATA_TO_INITIALIZE);
        return new Player(playerData.id, playerData.name, playerData.tiles);
    }

    handleGameUpdate(gameUpdateData: GameUpdateData): void {
        if (gameUpdateData.player1) {
            this.player1.updatePlayerData(gameUpdateData.player1);
        }
        if (gameUpdateData.player2) {
            this.player2.updatePlayerData(gameUpdateData.player2);
        }
        if (gameUpdateData.board) {
            this.boardService.updateBoard(gameUpdateData.board);
        }
        if (gameUpdateData.round) {
            this.roundManager.updateRound(gameUpdateData.round);
        }
        if (gameUpdateData.isGameOver) {
            this.gameOver();
        }
    }

    isLocalPlayerPlaying(): boolean {
        if (!this.localPlayerId || !this.roundManager.getCurrentPlayer()) return false;
        return this.localPlayerId === this.roundManager.getCurrentPlayer().id;
    }

    getGameId(): string {
        return this.gameId;
    }

    getLocalPlayer(): IPlayer | undefined {
        if (!this.localPlayerId) return undefined;
        return this.player1.id === this.localPlayerId ? this.player1 : this.player2;
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
