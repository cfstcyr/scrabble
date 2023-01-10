import { Action, ActionExchange, ActionHelp, ActionPass, ActionPlace, ActionReserve } from '@app/classes/actions';
import ActionHint from '@app/classes/actions/action-hint/action-hint';
import { Position } from '@app/classes/board';
import { ActionData, ActionExchangePayload, ActionPlacePayload, ActionType } from '@app/classes/communication/action-data';
import { FeedbackMessage, FeedbackMessages } from '@app/classes/communication/feedback-messages';
import { GameUpdateData } from '@app/classes/communication/game-update-data';
import { GameObjectivesData } from '@app/classes/communication/objective-data';
import { RoundData } from '@app/classes/communication/round-data';
import Game from '@app/classes/game/game';
import { GameType } from '@app/classes/game/game-type';
import { HttpException } from '@app/classes/http-exception/http-exception';
import Player from '@app/classes/player/player';
import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
import { BeginnerVirtualPlayer } from '@app/classes/virtual-player/beginner-virtual-player/beginner-virtual-player';
import { ExpertVirtualPlayer } from '@app/classes/virtual-player/expert-virtual-player/expert-virtual-player';
import { MUST_HAVE_7_TILES_TO_SWAP } from '@app/constants/classes-errors';
import { IS_OPPONENT, IS_REQUESTING } from '@app/constants/game-constants';
import { INVALID_COMMAND, INVALID_PAYLOAD, NOT_PLAYER_TURN } from '@app/constants/services-errors';
import { MINIMUM_TILES_LEFT_FOR_EXCHANGE } from '@app/constants/virtual-player-constants';
import { ActiveGameService } from '@app/services/active-game-service/active-game.service';
import DictionaryService from '@app/services/dictionary-service/dictionary.service';
import GameHistoriesService from '@app/services/game-history-service/game-history.service';
import HighScoresService from '@app/services/high-score-service/high-score.service';
import VirtualPlayerProfilesService from '@app/services/virtual-player-profile-service/virtual-player-profile.service';
import { VirtualPlayerService } from '@app/services/virtual-player-service/virtual-player.service';
import { isIdVirtualPlayer } from '@app/utils/is-id-virtual-player/is-id-virtual-player';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class GamePlayService {
    constructor(
        private readonly activeGameService: ActiveGameService,
        private readonly highScoresService: HighScoresService,
        private readonly dictionaryService: DictionaryService,
        private readonly gameHistoriesService: GameHistoriesService,
        private readonly virtualPlayerService: VirtualPlayerService,
        private readonly virtualPlayerProfilesService: VirtualPlayerProfilesService,
    ) {
        this.activeGameService.playerLeftEvent.on('playerLeft', async (gameId, playerWhoLeftId) => {
            await this.handlePlayerLeftEvent(gameId, playerWhoLeftId);
        });
    }

    async playAction(gameId: string, playerId: string, actionData: ActionData): Promise<[void | GameUpdateData, void | FeedbackMessages]> {
        const game = this.activeGameService.getGame(gameId, playerId);
        const player = game.getPlayer(playerId, IS_REQUESTING);
        if (player.id !== playerId) throw new HttpException(NOT_PLAYER_TURN, StatusCodes.FORBIDDEN);
        if (game.gameIsOver) return [undefined, undefined];

        const action: Action = this.getAction(player, game, actionData);

        let updatedData: void | GameUpdateData = action.execute();

        const localPlayerFeedback: FeedbackMessage = action.getMessage();
        const opponentFeedback: FeedbackMessage = action.getOpponentMessage();
        let endGameFeedback: FeedbackMessage[] = [];

        if (updatedData) {
            updatedData = this.addMissingPlayerId(gameId, playerId, updatedData);
            updatedData.tileReserve = Array.from(game.getTilesLeftPerLetter(), ([letter, amount]) => ({ letter, amount }));
        }

        if (action.willEndTurn()) {
            const nextRound = game.roundManager.nextRound(action);
            const nextRoundData: RoundData = game.roundManager.convertRoundToRoundData(nextRound);
            if (updatedData) updatedData.round = nextRoundData;
            else updatedData = { round: nextRoundData };
            if (game.areGameOverConditionsMet()) {
                endGameFeedback = await this.handleGameOver(undefined, game, updatedData);
            }
        }
        return [updatedData, { localPlayerFeedback, opponentFeedback, endGameFeedback }];
    }

    getAction(player: Player, game: Game, actionData: ActionData): Action {
        switch (actionData.type) {
            case ActionType.PLACE: {
                const payload = this.getActionPlacePayload(actionData);
                const startPosition = new Position(payload.startPosition.row, payload.startPosition.column);
                return new ActionPlace(player, game, { tilesToPlace: payload.tiles, startPosition, orientation: payload.orientation });
            }
            case ActionType.EXCHANGE: {
                const totalTilesLeft = this.activeGameService.getGame(game.getId(), player.id).getTotalTilesLeft();
                if (!this.isExchangeLegal(player, totalTilesLeft)) throw new HttpException(MUST_HAVE_7_TILES_TO_SWAP, StatusCodes.FORBIDDEN);

                const payload = this.getActionExchangePayload(actionData);
                return new ActionExchange(player, game, payload.tiles ?? []);
            }
            case ActionType.PASS: {
                return new ActionPass(player, game);
            }
            case ActionType.HELP: {
                return new ActionHelp(player, game);
            }
            case ActionType.RESERVE: {
                return new ActionReserve(player, game);
            }
            case ActionType.HINT: {
                return new ActionHint(player, game);
            }
            default: {
                throw Error(INVALID_COMMAND);
            }
        }
    }

    getActionPlacePayload(actionData: ActionData): ActionPlacePayload {
        const payload = actionData.payload as ActionPlacePayload;
        if (payload.tiles.length <= 0) throw new HttpException(INVALID_PAYLOAD, StatusCodes.BAD_REQUEST);
        if (payload.startPosition === undefined) throw new HttpException(INVALID_PAYLOAD, StatusCodes.BAD_REQUEST);
        if (payload.orientation === undefined) throw new HttpException(INVALID_PAYLOAD, StatusCodes.BAD_REQUEST);
        return payload;
    }

    getActionExchangePayload(actionData: ActionData): ActionExchangePayload {
        const payload = actionData.payload as ActionExchangePayload;
        if (payload.tiles.length <= 0) throw new HttpException(INVALID_PAYLOAD, StatusCodes.BAD_REQUEST);
        return payload;
    }

    isGameOver(gameId: string, playerId: string): boolean {
        return this.activeGameService.getGame(gameId, playerId).gameIsOver;
    }

    handleResetObjectives(gameId: string, playerId: string): GameUpdateData {
        const game: Game = this.activeGameService.getGame(gameId, playerId);
        if (game.gameType === GameType.Classic) return {};

        const objectiveData: GameObjectivesData = game.resetPlayerObjectiveProgression(playerId);
        return { gameObjective: objectiveData };
    }

    private isExchangeLegal(player: Player, totalTilesLeft: number): boolean {
        return player instanceof ExpertVirtualPlayer || totalTilesLeft >= MINIMUM_TILES_LEFT_FOR_EXCHANGE;
    }

    private async handleGameOver(winnerName: string | undefined, game: Game, updatedData: GameUpdateData): Promise<FeedbackMessage[]> {
        const [updatedScorePlayer1, updatedScorePlayer2] = game.endOfGame(winnerName);
        if (!game.isAddedToDatabase) {
            const connectedRealPlayers = game.getConnectedRealPlayers();
            for (const player of connectedRealPlayers) {
                await this.highScoresService.addHighScore(player.name, player.score, game.gameType);
            }
            await this.gameHistoriesService.addGameHistory(game.gameHistory);
            game.isAddedToDatabase = true;
        }

        this.dictionaryService.stopUsingDictionary(game.dictionarySummary.id, true);

        if (updatedData.player1) updatedData.player1.score = updatedScorePlayer1;
        else updatedData.player1 = { id: game.player1.id, score: updatedScorePlayer1 };
        if (updatedData.player2) updatedData.player2.score = updatedScorePlayer2;
        else updatedData.player2 = { id: game.player2.id, score: updatedScorePlayer2 };

        updatedData.isGameOver = true;
        updatedData.winners = winnerName ? [winnerName] : game.computeWinners();
        return game.endGameMessage(winnerName);
    }

    private async handlePlayerLeftEvent(gameId: string, playerWhoLeftId: string): Promise<void> {
        const game = this.activeGameService.getGame(gameId, playerWhoLeftId);
        const playerStillInGame = game.getPlayer(playerWhoLeftId, IS_OPPONENT);

        if (isIdVirtualPlayer(playerStillInGame.id)) {
            game.getPlayer(playerWhoLeftId, IS_REQUESTING).isConnected = false;
            await this.handleGameOver(playerStillInGame.name, game, {});
            this.activeGameService.removeGame(gameId, playerWhoLeftId);
            return;
        }

        const updatedData: GameUpdateData = game.replacePlayer(
            playerWhoLeftId,
            new BeginnerVirtualPlayer(gameId, await this.virtualPlayerProfilesService.getRandomVirtualPlayerName(VirtualPlayerLevel.Beginner)),
        );

        if (this.isVirtualPlayerTurn(game)) {
            this.virtualPlayerService.triggerVirtualPlayerTurn(
                { round: game.roundManager.convertRoundToRoundData(game.roundManager.getCurrentRound()) },
                game,
            );
        }
        this.activeGameService.playerLeftEvent.emit('playerLeftFeedback', gameId, [], updatedData);
    }

    private addMissingPlayerId(gameId: string, playerId: string, gameUpdateData: GameUpdateData): GameUpdateData {
        const game: Game = this.activeGameService.getGame(gameId, playerId);
        const newGameUpdateData: GameUpdateData = { ...gameUpdateData };
        if (newGameUpdateData.player1) {
            newGameUpdateData.player1.id = game.player1.id;
        }
        if (newGameUpdateData.player2) {
            newGameUpdateData.player2.id = game.player2.id;
        }
        return newGameUpdateData;
    }

    private isVirtualPlayerTurn(game: Game): boolean {
        return isIdVirtualPlayer(game.roundManager.getCurrentRound().player.id);
    }
}
