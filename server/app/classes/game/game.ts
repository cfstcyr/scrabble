import Board from '@app/classes/board/board';
import { RoundData } from '@app/classes/communication/round-data';
import Player from '@app/classes/player/player';
import { Round } from '@app/classes/round/round';
import RoundManager from '@app/classes/round/round-manager';
import { LetterValue, Tile } from '@app/classes/tile';
import TileReserve from '@app/classes/tile/tile-reserve';
import { TileReserveData } from '@app/classes/tile/tile.types';
import { AbstractVirtualPlayer } from '@app/classes/virtual-player/abstract-virtual-player';
import { END_GAME_HEADER_MESSAGE, START_TILES_AMOUNT } from '@app/constants/classes-constants';
import { WINNER_MESSAGE } from '@app/constants/game';
import { INVALID_PLAYER_ID_FOR_GAME } from '@app/constants/services-errors';
import BoardService from '@app/services/board-service/board.service';
import { DictionarySummary } from '@app/classes/dictionary/dictionary-data';
import { ReadyGameConfig, StartGameData } from './game-config';
import { GameType } from './game-type';
export const GAME_OVER_PASS_THRESHOLD = 6;
export const WIN = 1;
export const LOSE = -1;

export default class Game {
    private static boardService: BoardService;
    roundManager: RoundManager;
    gameType: GameType;
    board: Board;
    dictionarySummary: DictionarySummary;
    player1: Player;
    player2: Player;
    isAddedToDatabase: boolean;
    gameIsOver: boolean;
    private tileReserve: TileReserve;
    private id: string;

    static injectServices(boardService: BoardService): void {
        if (!Game.getBoardService()) {
            Game.boardService = boardService;
        }
    }

    static async createGame(id: string, config: ReadyGameConfig): Promise<Game> {
        const game = new Game();

        game.id = id;
        game.player1 = config.player1;
        game.player2 = config.player2;
        game.roundManager = new RoundManager(config.maxRoundTime, config.player1, config.player2);
        game.gameType = config.gameType;
        game.dictionarySummary = config.dictionary;
        game.tileReserve = new TileReserve();
        game.board = this.boardService.initializeBoard();
        game.isAddedToDatabase = false;
        game.gameIsOver = false;

        await game.tileReserve.init();

        game.player1.tiles = game.tileReserve.getTiles(START_TILES_AMOUNT);
        game.player2.tiles = game.tileReserve.getTiles(START_TILES_AMOUNT);

        game.roundManager.beginRound();

        return game;
    }

    private static getBoardService(): BoardService {
        return Game.boardService;
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
        throw new Error(INVALID_PLAYER_ID_FOR_GAME);
    }

    areGameOverConditionsMet(): boolean {
        return !this.player1.hasTilesLeft() || !this.player2.hasTilesLeft() || this.roundManager.getPassCounter() >= GAME_OVER_PASS_THRESHOLD;
    }

    endOfGame(winnerName: string | undefined): [number, number] {
        this.gameIsOver = true;
        if (winnerName) {
            if (winnerName === this.player1.name) {
                return this.computeEndOfGameScore(WIN, LOSE, this.player2.getTileRackPoints(), this.player2.getTileRackPoints());
            } else {
                return this.computeEndOfGameScore(LOSE, WIN, this.player1.getTileRackPoints(), this.player1.getTileRackPoints());
            }
        } else {
            return this.getEndOfGameScores();
        }
    }

    endGameMessage(winnerName: string | undefined): string[] {
        const messages: string[] = [END_GAME_HEADER_MESSAGE, this.player1.endGameMessage(), this.player2.endGameMessage()];
        const winnerMessage = winnerName ? WINNER_MESSAGE(winnerName) : this.congratulateWinner();
        messages.push(winnerMessage);
        return messages;
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
            player1: this.player1,
            player2: this.player2,
            gameType: this.gameType,
            maxRoundTime: this.roundManager.getMaxRoundTime(),
            dictionary: this.dictionarySummary,
            gameId: this.getId(),
            board: this.board.grid,
            tileReserve,
            round: roundData,
        };
        return startGameData;
    }

    private congratulateWinner(): string {
        let winner: string;
        if (this.player1.score > this.player2.score) {
            winner = this.player1.name;
        } else if (this.player1.score < this.player2.score) {
            winner = this.player2.name;
        } else {
            winner = this.player1.name + ' et ' + this.player2.name;
        }
        return WINNER_MESSAGE(winner);
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
}
