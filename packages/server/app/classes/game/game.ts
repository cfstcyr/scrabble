/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable max-lines */
import Board from '@app/classes/board/board';
import { DictionarySummary } from '@app/classes/communication/dictionary-data';
import { GameUpdateData } from '@app/classes/communication/game-update-data';
import { GameObjectivesData } from '@app/classes/communication/objective-data';
import { RoundData } from '@app/classes/communication/round-data';
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
import { WINNER_MESSAGE } from '@app/constants/game-constants';
import { INVALID_PLAYER_ID_FOR_GAME } from '@app/constants/services-errors';
import BoardService from '@app/services/board-service/board.service';
import ObjectivesService from '@app/services/objective-service/objective.service';
import { isIdVirtualPlayer } from '@app/utils/is-id-virtual-player/is-id-virtual-player';
import { Channel } from '@common/models/chat/channel';
import { NoIdGameHistoryWithPlayers } from '@common/models/game-history';
import { TypeOfId } from '@common/types/id';
import { StatusCodes } from 'http-status-codes';
import { Container } from 'typedi';
import { FeedbackMessage } from '@app/classes/communication/feedback-messages';
import { ReadyGameConfig, StartGameData } from './game-config';
import { GameMode } from './game-mode';
import { GameType } from './game-type';
import { INVALID_LIST_LENGTH } from '@app/constants/classes-errors';

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
    player3: Player;
    player4: Player;
    isAddedToDatabase: boolean;
    gameIsOver: boolean;
    gameHistory: NoIdGameHistoryWithPlayers;
    private tileReserve: TileReserve;
    private id: string;
    private readonly groupChannelId: TypeOfId<Channel>;

    constructor(groupChannelId: TypeOfId<Channel>) {
        this.groupChannelId = groupChannelId;
    }

    static injectServices(): void {
        if (!Game.boardService) {
            Game.boardService = Container.get(BoardService);
        }
        if (!Game.objectivesService) {
            Game.objectivesService = Container.get(ObjectivesService);
        }
    }

    static async createGame(id: string, groupChannelId: TypeOfId<Channel>, config: ReadyGameConfig): Promise<Game> {
        const game = new Game(groupChannelId);

        game.id = id;
        game.player1 = config.player1;
        game.player2 = config.player2;
        game.player3 = config.player3;
        game.player4 = config.player4;
        game.roundManager = new RoundManager(config.maxRoundTime, config.player1, config.player2, config.player3, config.player4);
        game.gameType = config.gameType;
        game.gameMode = config.gameMode;
        game.dictionarySummary = config.dictionary;
        game.initializeObjectives();
        game.tileReserve = new TileReserve();
        game.board = this.boardService.initializeBoard();
        game.isAddedToDatabase = false;
        game.gameIsOver = false;

        await game.tileReserve.init();

        game.player1.tiles = game.tileReserve.getTiles(START_TILES_AMOUNT);
        game.player2.tiles = game.tileReserve.getTiles(START_TILES_AMOUNT);
        game.player3.tiles = game.tileReserve.getTiles(START_TILES_AMOUNT);
        game.player4.tiles = game.tileReserve.getTiles(START_TILES_AMOUNT);

        game.roundManager.beginRound();

        return game;
    }

    completeGameHistory(): void {
        this.gameHistory = {
            startTime: this.roundManager.getGameStartTime(),
            endTime: new Date(),
            playersData: [
                {
                    name: this.player1.name,
                    score: this.player1.score,
                    isVirtualPlayer: isIdVirtualPlayer(this.player1.id),
                    isWinner: this.isPlayerWinner(this.player1),
                },
                {
                    name: this.player2.name,
                    score: this.player2.score,
                    isVirtualPlayer: isIdVirtualPlayer(this.player2.id),
                    isWinner: this.isPlayerWinner(this.player2),
                },
                {
                    name: this.player3.name,
                    score: this.player3.score,
                    isVirtualPlayer: isIdVirtualPlayer(this.player3.id),
                    isWinner: this.isPlayerWinner(this.player3),
                },
                {
                    name: this.player4.name,
                    score: this.player4.score,
                    isVirtualPlayer: isIdVirtualPlayer(this.player4.id),
                    isWinner: this.isPlayerWinner(this.player4),
                },
            ],
            gameType: this.gameType,
            gameMode: this.gameMode,
            hasBeenAbandoned: !this.player1.isConnected || !this.player2.isConnected || !this.player3.isConnected || !this.player4.isConnected,
        };
    }

    isPlayerWinner(currentPlayer: Player): boolean {
        const opponents = this.getOpponentPlayers(currentPlayer);
        for (const opponent of opponents) {
            if (currentPlayer.score < opponent.score) {
                return false;
            }
        }
        return true;
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

    getGroupChannelId(): TypeOfId<Channel> {
        return this.groupChannelId;
    }

    getConnectedRealPlayers(): Player[] {
        const connectedRealPlayers: Player[] = [];
        if (this.player1.isConnected && !(this.player1 instanceof AbstractVirtualPlayer)) connectedRealPlayers.push(this.player1);
        if (this.player2.isConnected && !(this.player2 instanceof AbstractVirtualPlayer)) connectedRealPlayers.push(this.player2);
        if (this.player3.isConnected && !(this.player3 instanceof AbstractVirtualPlayer)) connectedRealPlayers.push(this.player3);
        if (this.player4.isConnected && !(this.player4 instanceof AbstractVirtualPlayer)) connectedRealPlayers.push(this.player4);
        return connectedRealPlayers;
    }

    getPlayer(playerId: string): Player {
        if (!this.isPlayerIdFromGame(playerId)) {
            throw new HttpException(INVALID_PLAYER_ID_FOR_GAME, StatusCodes.FORBIDDEN);
        }
        switch (playerId) {
            case this.player1.id:
                return this.player1;
            case this.player2.id:
                return this.player2;
            case this.player3.id:
                return this.player3;
            case this.player4.id:
                return this.player4;
            default:
                throw new HttpException(INVALID_PLAYER_ID_FOR_GAME, StatusCodes.FORBIDDEN);
        }
    }

    getPlayerNumber(player: Player): number {
        if (!this.isPlayerIdFromGame(player.id)) {
            throw new HttpException(INVALID_PLAYER_ID_FOR_GAME, StatusCodes.FORBIDDEN);
        }
        switch (player) {
            case this.player1:
                return 1;
            case this.player2:
                return 2;
            case this.player3:
                return 3;
            case this.player4:
                return 4;
            default:
                throw new HttpException(INVALID_PLAYER_ID_FOR_GAME, StatusCodes.FORBIDDEN);
        }
    }

    getOpponentPlayers(player: string | Player): Player[] {
        const opponentPlayers: Player[] = [];
        const playerId = player instanceof Player ? player.id : player;
        if (!this.isPlayerIdFromGame(playerId)) {
            throw new HttpException(INVALID_PLAYER_ID_FOR_GAME, StatusCodes.FORBIDDEN);
        }
        if (this.player1.id !== playerId) opponentPlayers.push(this.player1);
        if (this.player2.id !== playerId) opponentPlayers.push(this.player2);
        if (this.player3.id !== playerId) opponentPlayers.push(this.player3);
        if (this.player4.id !== playerId) opponentPlayers.push(this.player4);
        return opponentPlayers;
    }

    replacePlayer(playerId: string, newPlayer: Player): GameUpdateData {
        if (!this.isPlayerIdFromGame(playerId)) throw new HttpException(INVALID_PLAYER_ID_FOR_GAME, StatusCodes.FORBIDDEN);

        const updatedData: GameUpdateData = {};
        switch (playerId) {
            case this.player1.id:
                updatedData.player1 = newPlayer.copyPlayerInfo(this.player1);
                this.player1 = newPlayer;
                break;
            case this.player2.id:
                updatedData.player2 = newPlayer.copyPlayerInfo(this.player2);
                this.player2 = newPlayer;
                break;
            case this.player3.id:
                updatedData.player3 = newPlayer.copyPlayerInfo(this.player3);
                this.player3 = newPlayer;
                break;
            case this.player4.id:
                updatedData.player4 = newPlayer.copyPlayerInfo(this.player4);
                this.player4 = newPlayer;
                break;
            default:
                break;
        }

        this.roundManager.replacePlayer(playerId, newPlayer);
        this.gameMode = GameMode.Solo;

        return updatedData;
    }

    areGameOverConditionsMet(): boolean {
        return (
            !this.player1.hasTilesLeft() ||
            !this.player2.hasTilesLeft() ||
            !this.player3.hasTilesLeft() ||
            !this.player4.hasTilesLeft() ||
            this.roundManager.verifyIfGameOver()
        );
    }

    endOfGame(): number[] {
        this.gameIsOver = true;

        const finalScores = this.getEndOfGameScores();

        this.completeGameHistory();
        return finalScores;
    }

    endGameMessage(): FeedbackMessage[] {
        const messages: string[] = [
            END_GAME_HEADER_MESSAGE,
            this.player1.endGameMessage(),
            this.player2.endGameMessage(),
            this.player3.endGameMessage(),
            this.player4.endGameMessage(),
        ];
        const winnerNames: string[] = this.computeWinners();
        messages.push(WINNER_MESSAGE(winnerNames.join(' et ')));
        return messages.map((message: string) => {
            return { message };
        });
    }

    createStartGameData(): StartGameData {
        const tileReserve: TileReserveData[] = [];
        this.addTilesToReserve(tileReserve);
        const round: Round = this.roundManager.getCurrentRound();
        const roundData: RoundData = this.roundManager.convertRoundToRoundData(round);
        const startGameData: StartGameData = {
            player1: this.player1.convertToPlayerData(),
            player2: this.player2.convertToPlayerData(),
            player3: this.player3.convertToPlayerData(),
            player4: this.player4.convertToPlayerData(),
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
        return Game.objectivesService.resetPlayerObjectiveProgression(this, this.getPlayer(playerId));
    }

    computeWinners(): string[] {
        const winners: string[] = [];
        if (this.isPlayerWinner(this.player1)) winners.push(this.player1.name);
        if (this.isPlayerWinner(this.player2)) winners.push(this.player2.name);
        if (this.isPlayerWinner(this.player3)) winners.push(this.player3.name);
        if (this.isPlayerWinner(this.player4)) winners.push(this.player4.name);

        return winners;
    }

    private computeEndOfGameScore(playerHasWon: boolean[], playerPointsToDeduct: number[]): number[] {
        const players = this.getPlayerArray();
        if (playerHasWon.length !== players.length || playerPointsToDeduct.length !== players.length)
            throw new HttpException(INVALID_LIST_LENGTH, StatusCodes.FORBIDDEN);

        for (let i = 0; i < players.length; i++) {
            if (playerHasWon[i]) {
                for (let j = 0; j < players.length; j++) {
                    if (i !== j) {
                        players[i].score += playerPointsToDeduct[j];
                    }
                }
            } else {
                players[i].score -= playerPointsToDeduct[i];
            }
        }
        return [this.player1.score, this.player2.score, this.player3.score, this.player4.score];
    }

    private getEndOfGameScores(): number[] {
        const playerHasWon = [!this.player1.hasTilesLeft(), !this.player2.hasTilesLeft(), !this.player3.hasTilesLeft(), !this.player4.hasTilesLeft()];
        const playerPointsToDeduct = [
            this.player1.getTileRackPoints(),
            this.player2.getTileRackPoints(),
            this.player3.getTileRackPoints(),
            this.player4.getTileRackPoints(),
        ];
        return this.computeEndOfGameScore(playerHasWon, playerPointsToDeduct);
    }

    private addTilesToReserve(tileReserve: TileReserveData[]): void {
        this.getTilesLeftPerLetter().forEach((amount: number, letter: LetterValue) => {
            tileReserve.push({ letter, amount });
        });
    }

    private isPlayerIdFromGame(playerId: string): boolean {
        return this.player1.id === playerId || this.player2.id === playerId || this.player3.id === playerId || this.player4.id === playerId;
    }

    private initializeObjectives(): void {
        if (this.gameType === GameType.Classic) return;

        const gameObjectives: GameObjectives = Game.objectivesService.createObjectivesForGame();
        this.player1.initializeObjectives(gameObjectives.publicObjectives, gameObjectives.player1Objective);
        this.player2.initializeObjectives(gameObjectives.publicObjectives, gameObjectives.player2Objective);
        this.player3.initializeObjectives(gameObjectives.publicObjectives, gameObjectives.player2Objective);
        this.player4.initializeObjectives(gameObjectives.publicObjectives, gameObjectives.player2Objective);
    }

    private getPlayerArray(): Player[] {
        return [this.player1, this.player2, this.player3, this.player4];
    }
}
