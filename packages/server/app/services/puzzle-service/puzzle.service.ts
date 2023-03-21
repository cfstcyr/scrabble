import { PuzzleGenerator } from '@app/classes/puzzle/puzzle-generator/puzzle-generator';
import { WordFindingUseCase, WordPlacement } from '@app/classes/word-finding';
import WordFindingPuzzle from '@app/classes/word-finding/word-finding-puzzle/word-finding-puzzle';
import { PUZZLE_COMPLETE_NO_ACTIVE_PUZZLE, PUZZLE_HAS_NO_SOLUTION } from '@app/constants/puzzle-constants';
import { User } from '@common/models/user';
import { TypeOfId } from '@common/types/id';
import { Service } from 'typedi';
import DictionaryService from '@app/services/dictionary-service/dictionary.service';
import { ScoreCalculatorService } from '@app/services/score-calculator-service/score-calculator.service';
import { WordExtraction } from '@app/classes/word-extraction/word-extraction';
import { Square } from '@app/classes/square';
import { Tile } from '@app/classes/tile';
import { HttpException } from '@app/classes/http-exception/http-exception';
import { StatusCodes } from 'http-status-codes';
import { StringConversion } from '@app/utils/string-conversion/string-conversion';
import { WordsVerificationService } from '@app/services/words-verification-service/words-verification.service';
import { MAX_TILES_PER_PLAYER } from '@app/constants/game-constants';
import { PuzzleResult, PuzzleResultStatus } from '@common/models/puzzle';
import { Puzzle } from '@app/classes/puzzle/puzzle';

@Service()
export class PuzzleService {
    tilesToPlaceForBingo = MAX_TILES_PER_PLAYER;
    private activePuzzle = new Map<TypeOfId<User>, Puzzle>();

    constructor(
        private readonly dictionaryService: DictionaryService,
        private readonly scoreCalculatorService: ScoreCalculatorService,
        private readonly wordValidatorService: WordsVerificationService,
    ) {}

    startPuzzle(idUser: TypeOfId<User>): Puzzle {
        let puzzle: Puzzle | undefined;

        do {
            try {
                const generator = new PuzzleGenerator();
                puzzle = generator.generate();
            } catch {
                // nothing to do.
            }
        } while (!puzzle);

        this.activePuzzle.set(idUser, puzzle);

        return puzzle;
    }

    completePuzzle(idUser: TypeOfId<User>, wordPlacement: WordPlacement): PuzzleResult {
        const puzzle = this.activePuzzle.get(idUser);

        if (!puzzle) throw new Error(PUZZLE_COMPLETE_NO_ACTIVE_PUZZLE);

        this.activePuzzle.delete(idUser);

        const wordExtraction = new WordExtraction(puzzle.board);
        const createdWords = wordExtraction.extract(wordPlacement);
        if (!this.isLegalPlacement(createdWords, wordPlacement)) throw new HttpException('', StatusCodes.FORBIDDEN);

        let wordValid: boolean;

        try {
            this.wordValidatorService.verifyWords(
                StringConversion.wordsToString(createdWords),
                this.dictionaryService.getDefaultDictionary().summary.id,
            );
            wordValid = true;
        } catch {
            wordValid = false;
        }

        const scoredPoints =
            this.scoreCalculatorService.calculatePoints(createdWords) + this.scoreCalculatorService.bonusPoints(wordPlacement.tilesToPlace);

        const { targetPlacement, allPlacements } = this.getSolution(puzzle);

        return {
            userPoints: scoredPoints,
            result: wordValid
                ? wordPlacement.tilesToPlace.length >= this.tilesToPlaceForBingo
                    ? PuzzleResultStatus.Won
                    : PuzzleResultStatus.Valid
                : PuzzleResultStatus.Invalid,
            targetPlacement,
            allPlacements,
        };
    }

    abandonPuzzle(idUser: TypeOfId<User>): PuzzleResult {
        const puzzle = this.activePuzzle.get(idUser);

        if (!puzzle) throw new Error(PUZZLE_COMPLETE_NO_ACTIVE_PUZZLE);

        this.activePuzzle.delete(idUser);

        const { targetPlacement, allPlacements } = this.getSolution(puzzle);

        return {
            userPoints: -1,
            result: PuzzleResultStatus.Abandoned,
            targetPlacement,
            allPlacements,
        };
    }

    private getSolution(puzzle: Puzzle): Pick<PuzzleResult, 'targetPlacement' | 'allPlacements'> {
        const wordFinding = new WordFindingPuzzle(
            puzzle.board,
            puzzle.tiles,
            { useCase: WordFindingUseCase.Puzzle },
            this.dictionaryService.getDefaultDictionary(),
            this.scoreCalculatorService,
        );

        wordFinding.findWords();

        if (!wordFinding.easiestWordPlacement) throw new Error(PUZZLE_HAS_NO_SOLUTION);

        return { targetPlacement: wordFinding.easiestWordPlacement, allPlacements: wordFinding.wordPlacements };
    }

    private isLegalPlacement(words: [Square, Tile][][], wordPlacement: WordPlacement): boolean {
        const isAdjacentToPlacedTile = this.amountOfLettersInWords(words) !== wordPlacement.tilesToPlace.length;
        return isAdjacentToPlacedTile ? true : this.containsCenterSquare(words);
    }

    private amountOfLettersInWords(words: [Square, Tile][][]): number {
        return words.reduce((lettersInWords, word) => lettersInWords + word.length, 0);
    }

    private containsCenterSquare(words: [Square, Tile][][]): boolean {
        return words.some((word) => word.some(([square]) => square.isCenter));
    }
}
