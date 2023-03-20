/* eslint-disable max-classes-per-file */
import { Board, BoardNavigator } from '@app/classes/board';
import { Dictionary } from '@app/classes/dictionary';
import BoardService from '@app/services/board-service/board.service';
import DictionaryService from '@app/services/dictionary-service/dictionary.service';
import { WordsVerificationService } from '@app/services/words-verification-service/words-verification.service';
import { Container } from 'typedi';
import { Puzzle } from '@app/classes/puzzle';
import { BoardPlacement, BoardPlacementsExtractor } from '@app/classes/word-finding';
import { WordExtraction } from '@app/classes/word-extraction/word-extraction';
import { LetterValue, Tile } from '@app/classes/tile';
import { StringConversion } from '@app/utils/string-conversion/string-conversion';
import { DictionarySearcherRandom } from '@app/classes/word-finding/dictionary-searcher/dictionary-searcher-random';
import { MAX_TILES_PER_PLAYER } from '@app/constants/game-constants';
import { letterDistributionMap } from '@app/constants/letter-distributions';
import { Random } from '@app/utils/random/random';

const MIN_WORD_SIZE = 4;
const MAX_WORD_SIZE = 7;
const MIN_WORD_COUNT = 2;
const MAX_WORD_COUNT = 4;

type WordPlacementParams = Pick<BoardPlacement, 'maxSize' | 'minSize'>;

export class PuzzleGenerator {
    private readonly dictionaryService: DictionaryService;
    private readonly boardService: BoardService;
    private readonly wordsVerificationService: WordsVerificationService;
    private board: Board;
    private dictionary: Dictionary;

    constructor() {
        this.dictionaryService = Container.get(DictionaryService);
        this.boardService = Container.get(BoardService);
        this.wordsVerificationService = Container.get(WordsVerificationService);

        this.board = this.boardService.initializeBoard();
        this.dictionary = this.getDictionary();
    }

    generate(): Puzzle {
        this.generateBoard();
        const result = this.getBingo();

        if (!result) throw new Error('NOT VALID');

        return {
            board: this.board.grid,
            tiles: Random.shuffle(
                result.letters.map<Tile>((letter) => {
                    const letterValue = letter.toUpperCase() as LetterValue;
                    return { letter: letterValue, value: letterDistributionMap.get(letterValue)?.score ?? 0 };
                }),
            ),
        };
    }

    private getBingo(): { word: string; letters: string[] } | undefined {
        const extractor = new BoardPlacementsExtractor(this.board);

        for (const placement of extractor) {
            const wordSizeForBingo = MAX_TILES_PER_PLAYER + placement.letters.length;

            if (this.placementIsInvalid(placement, { minSize: wordSizeForBingo, maxSize: wordSizeForBingo })) continue;

            const word = this.generateWordForPlacement(placement, { minSize: wordSizeForBingo, maxSize: wordSizeForBingo });

            if (word) {
                return { word, letters: word.split('').filter((_, i) => !placement.letters.some(({ distance }) => distance === i)) };
            }
        }

        return undefined;
    }

    private generateBoard(): void {
        const wordsCount = Math.floor(Math.random() * (MAX_WORD_COUNT - MIN_WORD_COUNT)) + MIN_WORD_COUNT;

        for (let i = 0; i < wordsCount; ++i) {
            const extractor = new BoardPlacementsExtractor(this.board);

            let placedWord = false;

            for (const placement of extractor) {
                if (this.placementIsInvalid(placement)) continue;

                const word = this.generateWordForPlacement(placement, {});

                if (word) {
                    this.placeWord(this.board, word, placement);
                    placedWord = true;
                    break;
                }
            }

            if (!placedWord) throw new Error('Cannot place word');
        }
    }

    private generateWordForPlacement(
        placement: BoardPlacement,
        { maxSize = MAX_WORD_SIZE, minSize = MIN_WORD_SIZE }: Partial<WordPlacementParams> = {},
    ): string | undefined {
        const dictionarySearcher = new DictionarySearcherRandom(
            this.dictionary,
            this.convertPlacementForDictionarySearch(placement, { minSize, maxSize }),
        );

        for (const word of dictionarySearcher) {
            try {
                this.verifyWordForPlacement(word, placement);
                return word;
            } catch (e) {
                // nothing to do.
            }
        }

        return;
    }

    private convertPlacementForDictionarySearch(
        placement: BoardPlacement,
        { maxSize = MAX_WORD_SIZE, minSize = MIN_WORD_SIZE }: Partial<WordPlacementParams> = {},
    ): BoardPlacement {
        return {
            ...placement,
            maxSize: Math.min(placement.maxSize, maxSize),
            minSize: Math.max(placement.minSize, minSize),
        };
    }

    private verifyWordForPlacement(word: string, placement: BoardPlacement): void {
        const wordExtraction = new WordExtraction(this.board);
        const letters = word.split('').filter((l, i) => !placement.letters.find(({ distance }) => i === distance));

        const createdWords = wordExtraction.extract({
            tilesToPlace: letters.map<Tile>((letter) => {
                const letterValue = letter.toUpperCase() as LetterValue;
                return {
                    letter: letterValue,
                    value: letterDistributionMap.get(letterValue)?.score ?? 0,
                };
            }),
            orientation: placement.orientation,
            startPosition: placement.position,
        });

        this.wordsVerificationService.verifyWords(StringConversion.wordsToString(createdWords), this.dictionary.summary.id);
    }

    private placeWord(board: Board, word: string, placement: BoardPlacement): void {
        const navigator = new BoardNavigator(board, placement.position, placement.orientation);
        for (const c of word.split('')) {
            navigator.square.tile = { letter: c.toUpperCase() as LetterValue, value: 1 };
            navigator.forward();
        }
    }

    private placementIsInvalid(
        placement: BoardPlacement,
        { maxSize = MAX_WORD_SIZE, minSize = MIN_WORD_SIZE }: Partial<WordPlacementParams> = {},
    ): boolean {
        return (
            placement.perpendicularLetters.length > 2 ||
            (placement.letters.length > 0 && placement.letters[0].distance === 0) ||
            placement.maxSize < minSize ||
            placement.minSize > maxSize
        );
    }

    private getDictionary(): Dictionary {
        const summary = this.dictionaryService.getAllDictionarySummaries().find((dictionary) => dictionary.isDefault);

        if (!summary) throw new Error('Cannot find a dictionary');

        return this.dictionaryService.getDictionary(summary.id);
    }
}
