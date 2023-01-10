import Board from '@app/classes/board/board';
import { DictionarySummary } from '@app/classes/communication/dictionary-data';
import { FeedbackMessage } from '@app/classes/communication/feedback-messages';
import { GameUpdateData } from '@app/classes/communication/game-update-data';
import { GameObjectivesData } from '@app/classes/communication/objective-data';
import { RoundData } from '@app/classes/communication/round-data';
import { GameHistory } from '@app/classes/database/game-history';
import { HttpException } from '@app/classes/http-exception/http-exception';
import { GameObjectives } from '@app/classes/objectives/objective-utils';
import Player from '@app/classes/player/player';
import { Round } from '@app/classes/round/round';
import RoundManager from '@app/classes/round/round-manager';
import { LetterValue, Tile } from '@app/classes/tile';
import TileReserve from '@app/classes/tile/tile-reserve';
import { TileReserveData } from '@app/classes/tile/tile.types';
import { AbstractVirtualPlayer } from '@app/classes/virtual-player/abstract-virtual-player/abstract-virtual-player';
import { END_GAME_HEADER_MESSAGE, START_TILES_AMOUNT } from '@app/constants/classes-constants';
import { IS_REQUESTING, WINNER_MESSAGE } from '@app/constants/game-constants';
import { INVALID_PLAYER_ID_FOR_GAME } from '@app/constants/services-errors';
import BoardService from '@app/services/board-service/board.service';
import ObjectivesService from '@app/services/objective-service/objective.service';
import { isIdVirtualPlayer } from '@app/utils/is-id-virtual-player/is-id-virtual-player';
import { StatusCodes } from 'http-status-codes';
import { Container } from 'typedi';
import { ReadyGameConfig, StartGameData } from './game-config';
import { GameMode } from './game-mode';
import { GameType } from './game-type';
export const GAME_OVER_PASS_THRESHOLD = 6;
export const WIN = 1;
export const LOSE = -1;

export default class Game {
    private static boardService: BoardService;
    private static objectivesService: ObjectivesService;
    roundManager: RoundManager;
    gameType: GameType;
    gameMode: GameMode;
    board: Board;
    dictionarySummary: DictionarySummary;
    player1: Player;
    player2: Player;
    isAddedToDatabase: boolean;
    gameIsOver: boolean;
    gameHistory: GameHistory;
    private tileReserve: TileReserve;
    private id: string;

    static injectServices(): void {
        if (!Game.boardService) {
            Game.boardService = Container.get(BoardService);
        }
        if (!Game.objectivesService) {
            Game.objectivesService = Container.get(ObjectivesService);
        }
    }

    static async createGame(id: string, config: ReadyGameConfig): Promise<Game> {
        const game = new Game();

        game.id = id;
        game.player1 = config.player1;
        game.player2 = config.player2;
        game.roundManager = new RoundManager(config.maxRoundTime, config.player1, config.player2);
        game.gameType = config.gameType;
        game.gameMode = config.gameMode;
        game.dictionarySummary = config.dictionary;
        game.initializeObjectives();
        game.tileReserve = new TileReserve();
        game.board = this.boardService.initializeBoard();
        game.isAddedToDatabase = false;
        game.gameIsOver = false;

        game.initializeObjectives();
        await game.tileReserve.init();

        game.player1.tiles = game.tileReserve.getTiles(START_TILES_AMOUNT);
        game.player2.tiles = game.tileReserve.getTiles(START_TILES_AMOUNT);

        game.roundManager.beginRound();

        return game;
    }

    completeGameHistory(winnerName: string | undefined): void {
        this.gameHistory = {
            startTime: this.roundManager.getGameStartTime(),
            endTime: new Date(),
            player1Data: {
                name: this.player1.name,
                score: this.player1.score,
                isVirtualPlayer: isIdVirtualPlayer(this.player1.id),
                isWinner: this.isPlayerWinner(winnerName, this.player1, this.player2),
            },
            player2Data: {
                name: this.player2.name,
                score: this.player2.score,
                isVirtualPlayer: isIdVirtualPlayer(this.player2.id),
                isWinner: this.isPlayerWinner(winnerName, this.player2, this.player1),
            },
            gameType: this.gameType,
            gameMode: this.gameMode,
            hasBeenAbandoned: !this.player1.isConnected || !this.player2.isConnected,
        };
    }

    isPlayerWinner(winnerName: string | undefined, currentPlayer: Player, opponent: Player): boolean {
        return currentPlayer.name === winnerName || (!winnerName && currentPlayer.score >= opponent.score);
    }

    getTilesFromReserve(amount: number): Tile[] {
        return this.tileReserve.getTiles(amount);
    }

    swapTilesFromReserve(tilesToSwap: Tile[]): Tile[] {
        return this.tileReserve.swapTiles(tilesToSwap);
    }

    getTilesLeftPerLetter(): Map<LetterValue, number> {
        return this.tileReserve.getTilesLeftPerLetter();
    }

    getTotalTilesLeft(): number {
        return this.tileReserve.getTotalTilesLeft();
    }

    getId(): string {
        return this.id;
    }

    getConnectedRealPlayers(): Player[] {
        const connectedRealPlayers: Player[] = [];
        if (this.player1.isConnected && !(this.player1 instanceof AbstractVirtualPlayer)) connectedRealPlayers.push(this.player1);
        if (this.player2.isConnected && !(this.player2 instanceof AbstractVirtualPlayer)) connectedRealPlayers.push(this.player2);
        return connectedRealPlayers;
    }

    getPlayer(playerId: string, isRequestingPlayer: boolean): Player {
        if (this.isPlayerFromGame(playerId)) {
            if (this.player1.id === playerId) return isRequestingPlayer ? this.player1 : this.player2;
            if (this.player2.id === playerId) return isRequestingPlayer ? this.player2 : this.player1;
        }
        throw new HttpException(INVALID_PLAYER_ID_FOR_GAME, StatusCodes.FORBIDDEN);
    }

    replacePlayer(playerId: string, newPlayer: Player): GameUpdateData {
        if (!this.isPlayerFromGame(playerId)) throw new HttpException(INVALID_PLAYER_ID_FOR_GAME, StatusCodes.FORBIDDEN);

        const updatedData: GameUpdateData = {};
        if (this.player1.id === playerId) {
            updatedData.player1 = newPlayer.copyPlayerInfo(this.player1);
            this.player1 = newPlayer;
        } else {
            updatedData.player2 = newPlayer.copyPlayerInfo(this.player2);
            this.player2 = newPlayer;
        }

        this.roundManager.replacePlayer(playerId, newPlayer);
        this.gameMode = GameMode.Solo;

        return updatedData;
    }

    areGameOverConditionsMet(): boolean {
        return !this.player1.hasTilesLeft() || !this.player2.hasTilesLeft() || this.roundManager.getPassCounter() >= GAME_OVER_PASS_THRESHOLD;
    }

    endOfGame(winnerName: string | undefined): [number, number] {
        this.gameIsOver = true;
        let player1Score: number;
        let player2Score: number;

        if (winnerName) {
            [player1Score, player2Score] =
                winnerName === this.player1.name
                    ? this.computeEndOfGameScore(WIN, LOSE, this.player2.getTileRackPoints(), this.player2.getTileRackPoints())
                    : this.computeEndOfGameScore(LOSE, WIN, this.player1.getTileRackPoints(), this.player1.getTileRackPoints());
        } else {
            [player1Score, player2Score] = this.getEndOfGameScores();
        }

        this.completeGameHistory(winnerName);
        return [player1Score, player2Score];
    }

    endGameMessage(winnerName: string | undefined): FeedbackMessage[] {
        const messages: string[] = [END_GAME_HEADER_MESSAGE, this.player1.endGameMessage(), this.player2.endGameMessage()];
        const winnerNames: string[] = winnerName ? [winnerName] : this.computeWinners();
        messages.push(WINNER_MESSAGE(winnerNames.join(' et ')));
        return messages.map((message: string) => {
            return { message };
        });
    }

    isPlayer1(player: string | Player): boolean {
        return player instanceof Player ? this.player1.id === player.id : this.player1.id === player;
    }

    createStartGameData(): StartGameData {
        const tileReserve: TileReserveData[] = [];
        this.addTilesToReserve(tileReserve);
        const round: Round = this.roundManager.getCurrentRound();
        const roundData: RoundData = this.roundManager.convertRoundToRoundData(round);
        const startGameData: StartGameData = {
            player1: this.player1.convertToPlayerData(),
            player2: this.player2.convertToPlayerData(),
            gameType: this.gameType,
            gameMode: this.gameMode,
            maxRoundTime: this.roundManager.getMaxRoundTime(),
            dictionary: this.dictionarySummary,
            gameId: this.getId(),
            board: this.board.grid,
            tileReserve,
            round: roundData,
        };
        return startGameData;
    }

    resetPlayerObjectiveProgression(playerId: string): GameObjectivesData {
        return Game.objectivesService.resetPlayerObjectiveProgression(this, this.getPlayer(playerId, IS_REQUESTING));
    }

    computeWinners(): string[] {
        const winners: string[] = [];
        if (this.player1.score > this.player2.score) {
            winners.push(this.player1.name);
        } else if (this.player1.score < this.player2.score) {
            winners.push(this.player2.name);
        } else {
            winners.push(this.player1.name);
            winners.push(this.player2.name);
        }
        return winners;
    }

    private computeEndOfGameScore(
        player1Win: number,
        player2Win: number,
        player1PointsToDeduct: number,
        player2PointsToDeduct: number,
    ): [player1Score: number, player2Score: number] {
        this.player1.score += player1Win * player1PointsToDeduct;
        this.player2.score += player2Win * player2PointsToDeduct;
        return [this.player1.score, this.player2.score];
    }

    private getEndOfGameScores(): [number, number] {
        if (this.roundManager.getPassCounter() >= GAME_OVER_PASS_THRESHOLD) {
            return this.computeEndOfGameScore(LOSE, LOSE, this.player1.getTileRackPoints(), this.player2.getTileRackPoints());
        } else if (!this.player1.hasTilesLeft()) {
            return this.computeEndOfGameScore(WIN, LOSE, this.player2.getTileRackPoints(), this.player2.getTileRackPoints());
        } else {
            return this.computeEndOfGameScore(LOSE, WIN, this.player1.getTileRackPoints(), this.player1.getTileRackPoints());
        }
    }

    private addTilesToReserve(tileReserve: TileReserveData[]): void {
        this.getTilesLeftPerLetter().forEach((amount: number, letter: LetterValue) => {
            tileReserve.push({ letter, amount });
        });
    }

    private isPlayerFromGame(playerId: string): boolean {
        return this.player1.id === playerId || this.player2.id === playerId;
    }

    private initializeObjectives(): void {
        if (this.gameType === GameType.Classic) return;

        const gameObjectives: GameObjectives = Game.objectivesService.createObjectivesForGame();
        this.player1.initializeObjectives(gameObjectives.publicObjectives, gameObjectives.player1Objective);
        this.player2.initializeObjectives(gameObjectives.publicObjectives, gameObjectives.player2Objective);
    }
}
