import { Board, Orientation } from '@app/classes/board';
import { SHOULD_HAVE_A_TILE as HAS_TILE } from '@app/classes/board/board';
import BoardNavigator from '@app/classes/board/board-navigator';
import Direction from '@app/classes/board/direction';
import { Square } from '@app/classes/square';
import { Tile } from '@app/classes/tile';
import { WordExtraction } from '@app/classes/word-extraction/word-extraction';
import {
    MoveRequirements,
    PlacementEvaluationResults,
    RejectedMove,
    SearchState,
    SquareProperties,
    WordFindingRequest,
    WordFindingUseCase,
} from '@app/classes/word-finding';
import { Service } from 'typedi';
import { WordsVerificationService } from '@app/services/words-verification-service/words-verification.service';
import { StringConversion } from '@app/utils/string-conversion';
import { ScoreCalculatorService } from '@app/services/score-calculator-service/score-calculator.service';
import { Random } from '@app/utils/random';
import { INVALID_REQUEST_POINT_RANGE, NO_REQUEST_POINT_HISTORY, NO_REQUEST_POINT_RANGE } from '@app/constants/services-errors';
import {
    BLANK_TILE_REPLACEMENT_LETTER,
    HINT_AMOUNT_OF_WORDS,
    INITIAL_TILE,
    LONG_MOVE_TIME,
    QUICK_MOVE_TIME,
} from '@app/constants/services-constants/word-finding.const';
import { ScoredWordPlacement } from '@app/classes/word-finding/word-placement';
import DictionaryService from '@app/services/dictionary-service/dictionary.service';
import { arrayDeepCopy } from '@app/utils/deep-copy';

@Service()
export default class WordFindingService {
    private wordExtraction: WordExtraction;
    constructor(
        private wordVerificationService: WordsVerificationService,
        private scoreCalculatorService: ScoreCalculatorService,
        private dictionaryService: DictionaryService,
    ) {}

    findWords(board: Board, tiles: Tile[], request: WordFindingRequest): ScoredWordPlacement[] {
        const startTime = new Date();
        let searchState = SearchState.Selective;
        const placementEvaluationResults: PlacementEvaluationResults = {
            foundMoves: [],
            validMoves: [],
            rejectedValidMoves: [],
            pointDistributionChance: new Map(),
        };
        this.wordExtraction = new WordExtraction(board);
        let chosenMoves: ScoredWordPlacement[] | undefined;
        if (request.useCase === WordFindingUseCase.Beginner) {
            placementEvaluationResults.pointDistributionChance = this.assignAcceptanceProbability(request);
        }

        const rackPermutations = this.getRackPermutations(arrayDeepCopy(tiles));
        const emptySquares = board.getDesiredSquares((square: Square) => square.tile === null);

        while (emptySquares.length > 0 && searchState !== SearchState.Over) {
            const squareProperties = this.findSquareProperties(board, this.extractRandomSquare(emptySquares), tiles.length);

            placementEvaluationResults.foundMoves = this.attemptPermutations(rackPermutations, squareProperties);
            searchState = this.updateSearchState(startTime);
            chosenMoves = this.chooseMoves(searchState, request, placementEvaluationResults);
            if (chosenMoves) return chosenMoves;
        }

        chosenMoves = this.chooseMoves(searchState, request, placementEvaluationResults);
        return chosenMoves ? chosenMoves : [];
    }

    private attemptPermutations(rackPermutations: Tile[][], squareProperties: SquareProperties): ScoredWordPlacement[] {
        let foundMoves: ScoredWordPlacement[] = [];
        for (const permutation of rackPermutations) {
            foundMoves = foundMoves.concat(this.attemptMove(squareProperties, permutation));
        }
        return foundMoves;
    }

    private chooseMoves(
        searchState: SearchState,
        request: WordFindingRequest,
        placementEvaluationResults: PlacementEvaluationResults,
    ): ScoredWordPlacement[] | undefined {
        switch (request.useCase) {
            case WordFindingUseCase.Beginner: {
                return this.chooseMovesBeginner(searchState, request, placementEvaluationResults);
            }
            case WordFindingUseCase.Expert: {
                return this.chooseMovesExpert(searchState, placementEvaluationResults);
            }
            case WordFindingUseCase.Hint: {
                return this.chooseMovesHint(placementEvaluationResults);
            }
        }
    }

    private chooseMovesBeginner(
        searchState: SearchState,
        request: WordFindingRequest,
        placementEvaluationResults: PlacementEvaluationResults,
    ): ScoredWordPlacement[] | undefined {
        const movesInRange = this.getMovesInRange(placementEvaluationResults.foundMoves, request);
        for (const movesScore of movesInRange.values()) {
            for (const move of movesScore) {
                if (searchState === SearchState.Selective && this.isMoveAccepted(move.score, placementEvaluationResults.pointDistributionChance)) {
                    return [move];
                } else {
                    const acceptChance = placementEvaluationResults.pointDistributionChance.get(move.score);
                    if (acceptChance) placementEvaluationResults.rejectedValidMoves.push({ acceptChance, move });
                }
            }
        }
        if (searchState !== SearchState.Selective && placementEvaluationResults.rejectedValidMoves.length > 0)
            return [this.getHighestAcceptChanceMove(placementEvaluationResults.rejectedValidMoves)];
        return undefined;
    }

    private chooseMovesExpert(searchState: SearchState, placementEvaluationResults: PlacementEvaluationResults): ScoredWordPlacement[] | undefined {
        placementEvaluationResults.validMoves = placementEvaluationResults.validMoves.concat(placementEvaluationResults.foundMoves);
        if (searchState === SearchState.Over) {
            return placementEvaluationResults.validMoves.sort((previous, current) => current.score - previous.score).slice(0, 1);
        }
        return undefined;
    }

    private chooseMovesHint(placementEvaluationResults: PlacementEvaluationResults): ScoredWordPlacement[] | undefined {
        placementEvaluationResults.validMoves = placementEvaluationResults.validMoves.concat(placementEvaluationResults.foundMoves);
        if (placementEvaluationResults.validMoves.length > HINT_AMOUNT_OF_WORDS) {
            return Random.getRandomElementsFromArray(placementEvaluationResults.validMoves, HINT_AMOUNT_OF_WORDS);
        }
        return undefined;
    }

    private getHighestAcceptChanceMove(rejectedValidMoves: RejectedMove[]): ScoredWordPlacement {
        return rejectedValidMoves.sort((previous, current) => current.acceptChance - previous.acceptChance)[0].move;
    }

    private assignAcceptanceProbability(request: WordFindingRequest): Map<number, number> {
        if (!request.pointRange) throw new Error(NO_REQUEST_POINT_RANGE);
        if (!request.pointHistory) throw new Error(NO_REQUEST_POINT_HISTORY);
        if (request.pointRange.minimum > request.pointRange.maximum) throw new Error(INVALID_REQUEST_POINT_RANGE);

        const minFrequency = this.findMinFrequencyInRange(request);
        const scoreChanceDistribution = new Map<number, number>();

        for (let score = request.pointRange.minimum; score <= request.pointRange.maximum; score++) {
            const scoreFrequency = request.pointHistory.get(score);
            if (scoreFrequency) {
                scoreChanceDistribution.set(score, 1 / (scoreFrequency - minFrequency + 1));
            } else {
                scoreChanceDistribution.set(score, 1);
            }
        }
        return scoreChanceDistribution;
    }

    private updateSearchState(startTime: Date): SearchState {
        const currentTime = new Date();
        const timeElapsed = currentTime.getTime() - startTime.getTime();
        if (timeElapsed > LONG_MOVE_TIME) {
            return SearchState.Over;
        } else if (timeElapsed > QUICK_MOVE_TIME) {
            return SearchState.Unselective;
        } else {
            return SearchState.Selective;
        }
    }

    private isMoveAccepted(moveScore: number, pointDistributionChance: Map<number, number>): boolean {
        const acceptProbability = pointDistributionChance.get(moveScore);
        return acceptProbability ? acceptProbability > Math.random() : true;
    }

    private getMovesInRange(validMoves: ScoredWordPlacement[], request: WordFindingRequest): Map<number, ScoredWordPlacement[]> {
        if (!request.pointRange) throw new Error(NO_REQUEST_POINT_RANGE);
        const foundMoves = new Map<number, ScoredWordPlacement[]>();
        for (const move of validMoves) {
            if (request.pointRange.minimum <= move.score && move.score <= request.pointRange.maximum) {
                if (foundMoves.has(move.score)) {
                    foundMoves.get(move.score)?.push(move);
                } else {
                    foundMoves.set(move.score, [move]);
                }
            }
        }
        return foundMoves;
    }

    private findMinFrequencyInRange(request: WordFindingRequest): number {
        if (!request.pointRange) throw new Error(NO_REQUEST_POINT_RANGE);
        if (!request.pointHistory) throw new Error(NO_REQUEST_POINT_HISTORY);
        if (request.pointRange.minimum > request.pointRange.maximum) throw new Error(INVALID_REQUEST_POINT_RANGE);

        let minFrequency = Number.MAX_VALUE;
        for (let score = request.pointRange.minimum; score <= request.pointRange.maximum; score++) {
            const scoreFrequency = request.pointHistory.get(score);
            if (scoreFrequency && scoreFrequency < minFrequency) {
                minFrequency = scoreFrequency;
            }
        }
        return minFrequency;
    }

    private findMoveRequirements(navigator: BoardNavigator, tileRackSize: number): MoveRequirements {
        const moveRequirements = {
            isPossible: true,
            minimumLength: this.findMinimumWordLength(navigator),
            maximumLength: Number.POSITIVE_INFINITY,
        };

        if (moveRequirements.minimumLength > tileRackSize) {
            moveRequirements.isPossible = false;
            return moveRequirements;
        }
        moveRequirements.maximumLength = tileRackSize - this.findTilesLeftLengthAtExtremity(navigator, tileRackSize - moveRequirements.minimumLength);

        return moveRequirements;
    }

    private findMinimumWordLength(navigator: BoardNavigator): number {
        return INITIAL_TILE + navigator.moveUntil(Direction.Forward, () => navigator.verifyAllNeighbors(HAS_TILE) || navigator.square.isCenter);
    }

    private findTilesLeftLengthAtExtremity(navigator: BoardNavigator, tilesLeftSize: number): number {
        navigator.moveUntil(Direction.Forward, () => {
            if (navigator.isEmpty()) tilesLeftSize--;
            return tilesLeftSize === 0;
        });
        return tilesLeftSize;
    }

    private findSquareProperties(board: Board, square: Square, tileRackSize: number): SquareProperties {
        const navigator: BoardNavigator = new BoardNavigator(board, square.position, Orientation.Horizontal);
        return {
            square,
            horizontal: this.findMoveRequirements(navigator.clone(), tileRackSize),
            vertical: this.findMoveRequirements(navigator.clone().switchOrientation(), tileRackSize),
        };
    }

    private attemptMove(squareProperties: SquareProperties, permutation: Tile[]): ScoredWordPlacement[] {
        const validMoves: ScoredWordPlacement[] = [];
        let result = this.attemptMoveDirection(squareProperties, permutation, Orientation.Horizontal);
        if (result) validMoves.push(result);
        result = this.attemptMoveDirection(squareProperties, permutation, Orientation.Vertical);
        if (result) validMoves.push(result);
        return validMoves;
    }

    private attemptMoveDirection(squareProperties: SquareProperties, permutation: Tile[], orientation: Orientation): ScoredWordPlacement | undefined {
        const moveRequirements = this.getCorrespondingMovePossibility(squareProperties, orientation);
        if (moveRequirements.isPossible && this.isWithinRequirements(moveRequirements, permutation.length)) {
            try {
                const createdWords = this.wordExtraction.extract({
                    tilesToPlace: permutation,
                    startPosition: squareProperties.square.position,
                    orientation,
                });
                this.wordVerificationService.verifyWords(
                    StringConversion.wordsToString(createdWords),
                    this.dictionaryService.getDictionaryTitles()[0],
                );
                return {
                    tilesToPlace: permutation,
                    orientation,
                    startPosition: squareProperties.square.position,
                    score: this.scoreCalculatorService.calculatePoints(createdWords) + this.scoreCalculatorService.bonusPoints(permutation),
                };
            } catch (exception) {
                // Try to play the current move, if an error is thrown, it is invalid and do nothing
            }
        }
        return undefined;
    }

    private extractRandomSquare(squares: Square[]): Square {
        return squares.splice(Math.floor(Math.random() * squares.length), 1)[0];
    }

    private getCorrespondingMovePossibility(squareProperties: SquareProperties, orientation: Orientation): MoveRequirements {
        return orientation === Orientation.Horizontal ? squareProperties.horizontal : squareProperties.vertical;
    }

    private isWithinRequirements(movePossibility: MoveRequirements, target: number): boolean {
        return movePossibility.minimumLength <= target && target <= movePossibility.maximumLength;
    }

    private getTilesCombinations(tiles: Tile[]) {
        const res: Tile[][] = [[]];
        let currentCombination;
        for (const tile of tiles) {
            if (tile.isBlank) {
                tile.letter = BLANK_TILE_REPLACEMENT_LETTER;
            }
        }

        // Try every combination of either including or excluding each Tile of the array
        // eslint-disable-next-line no-bitwise
        const maxCombinations = 1 << tiles.length;
        for (let i = 0; i < maxCombinations; ++i) {
            currentCombination = [];
            for (let j = 0; j < tiles.length; ++j) {
                // If the tile has to be included in the current combination
                // eslint-disable-next-line no-bitwise
                if (i & (1 << j)) {
                    currentCombination.push(tiles[j]);
                }
            }
            res.push(currentCombination);
        }
        return res.filter((l) => l.length > 0);
    }

    private permuteTiles(tiles: Tile[], result: Tile[][], current: Tile[] = []): void {
        if (tiles.length === 0) {
            result.push(current);
            return;
        }

        for (let i = 0; i < tiles.length; i++) {
            const tile = tiles[i];
            const leftTiles = tiles.slice(0, i);
            const rightTiles = tiles.slice(i + 1);
            const rest = leftTiles.concat(rightTiles);
            this.permuteTiles(rest, result, current.concat(tile));
        }
    }

    private getRackPermutations(tiles: Tile[]): Tile[][] {
        const result: Tile[][] = [];
        const tileRackPermutations: Tile[][] = this.getTilesCombinations(tiles);
        for (const permutation of tileRackPermutations) {
            this.permuteTiles(permutation, result);
        }
        return result;
    }
}