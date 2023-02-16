import ActionPlay from '@app/classes/actions/abstract-actions/action-play';
import { ActionUtils } from '@app/classes/actions/action-utils/action-utils';
import { ActionData, ActionPlacePayload, ActionType } from '@app/classes/communication/action-data';
import { FeedbackMessage } from '@app/classes/communication/feedback-messages';
import { GameUpdateData } from '@app/classes/communication/game-update-data';
import { PlayerData } from '@app/classes/communication/player-data';
import Game from '@app/classes/game/game';
import { GameType } from '@app/classes/game/game-type';
import { HttpException } from '@app/classes/http-exception/http-exception';
import { ObjectiveUpdate } from '@app/classes/objectives/objective-utils';
import Player from '@app/classes/player/player';
import { Square } from '@app/classes/square';
import { Tile } from '@app/classes/tile';
import { WordExtraction } from '@app/classes/word-extraction/word-extraction';
import { ScoredWordPlacement, WordPlacement } from '@app/classes/word-finding';
import { IN_UPPER_CASE } from '@app/constants/classes-constants';
import { ScoreCalculatorService } from '@app/services/score-calculator-service/score-calculator.service';
import { WordsVerificationService } from '@app/services/words-verification-service/words-verification.service';
import { fillPlayerData } from '@app/utils/fill-player-data/fill-player-data';
import { PlacementToString } from '@app/utils/placement-to-string/placement-to-string';
import { StringConversion } from '@app/utils/string-conversion/string-conversion';
import { StatusCodes } from 'http-status-codes';
import { Container } from 'typedi';
import { IMPOSSIBLE_ACTION } from './action-errors';

export default class ActionPlace extends ActionPlay {
    wordPlacement: WordPlacement;
    private scoreCalculator: ScoreCalculatorService;
    private wordValidator: WordsVerificationService;
    private objectivesCompletedMessages: string[];
    private scoredPoints: number;

    constructor(player: Player, game: Game, wordPlacement: WordPlacement) {
        super(player, game);
        this.wordPlacement = wordPlacement;
        this.scoreCalculator = Container.get(ScoreCalculatorService);
        this.wordValidator = Container.get(WordsVerificationService);
        this.objectivesCompletedMessages = [];
        this.scoredPoints = 0;
    }

    static createActionData(scoredWordPlacement: ScoredWordPlacement): ActionData {
        return {
            type: ActionType.PLACE,
            payload: this.createActionPlacePayload(scoredWordPlacement),
            input: '',
        };
    }

    private static createActionPlacePayload(scoredWordPlacement: ScoredWordPlacement): ActionPlacePayload {
        return {
            tiles: scoredWordPlacement.tilesToPlace,
            orientation: scoredWordPlacement.orientation,
            startPosition: scoredWordPlacement.startPosition,
        };
    }

    execute(): void | GameUpdateData {
        const [tilesToPlace, unplayedTiles] = ActionUtils.getTilesFromPlayer(this.wordPlacement.tilesToPlace, this.player);

        const wordExtraction = new WordExtraction(this.game.board);
        const createdWords: [Square, Tile][][] = wordExtraction.extract(this.wordPlacement);
        if (!this.isLegalPlacement(createdWords)) throw new HttpException(IMPOSSIBLE_ACTION, StatusCodes.FORBIDDEN);

        this.wordValidator.verifyWords(StringConversion.wordsToString(createdWords), this.game.dictionarySummary.id);

        this.scoredPoints = this.scoreCalculator.calculatePoints(createdWords) + this.scoreCalculator.bonusPoints(tilesToPlace);

        let objectiveUpdateResult: ObjectiveUpdate | undefined;
        if (this.game.gameType === GameType.LOG2990) {
            objectiveUpdateResult = this.player.validateObjectives({
                wordPlacement: this.wordPlacement,
                game: this.game,
                scoredPoints: this.scoredPoints,
                createdWords,
            });
            this.objectivesCompletedMessages = objectiveUpdateResult ? objectiveUpdateResult.completionMessages : [];
        }

        const updatedSquares = this.updateBoard(createdWords);

        this.player.tiles = unplayedTiles.concat(this.game.getTilesFromReserve(tilesToPlace.length));
        this.player.score += this.scoredPoints;

        const playerData: PlayerData = { id: this.player.id, tiles: this.player.tiles, score: this.player.score };

        const response: GameUpdateData = {
            board: updatedSquares,
            gameObjective: objectiveUpdateResult ? objectiveUpdateResult.updateData : undefined,
        };

        fillPlayerData(response, this.game.getPlayerNumber(this.player), playerData);

        return response;
    }

    getMessage(): FeedbackMessage {
        let placeMessage = `Vous avez placé ${PlacementToString.tilesToString(this.wordPlacement.tilesToPlace, IN_UPPER_CASE)} pour ${
            this.scoredPoints
        } points`;
        this.objectivesCompletedMessages.forEach((message: string) => {
            placeMessage += `<br><br>Vous avez${message}`;
        });
        return { message: placeMessage };
    }

    getOpponentMessage(): FeedbackMessage {
        let placeMessage = `${this.player.name} a placé ${PlacementToString.tilesToString(this.wordPlacement.tilesToPlace, IN_UPPER_CASE)} pour ${
            this.scoredPoints
        } points`;
        this.objectivesCompletedMessages.forEach((message: string) => {
            placeMessage += `<br><br>${this.player.name} a${message}`;
        });
        return { message: placeMessage };
    }

    private isLegalPlacement(words: [Square, Tile][][]): boolean {
        const isAdjacentToPlacedTile = this.amountOfLettersInWords(words) !== this.wordPlacement.tilesToPlace.length;
        return isAdjacentToPlacedTile ? true : this.containsCenterSquare(words);
    }

    private amountOfLettersInWords(words: [Square, Tile][][]): number {
        return words.reduce((lettersInWords, word) => lettersInWords + word.length, 0);
    }

    private containsCenterSquare(words: [Square, Tile][][]): boolean {
        return words.some((word) => word.some(([square]) => square.isCenter));
    }

    private updateBoard(words: [Square, Tile][][]): Square[] {
        const updatedSquares: Square[] = [];
        for (const word of words) {
            for (const [square, tile] of word) {
                if (square.tile) continue;

                square.tile = tile;
                square.wasMultiplierUsed = true;
                const position = square.position;
                updatedSquares.push(square);
                this.game.board.placeTile(tile, position);
            }
        }

        return updatedSquares;
    }
}
