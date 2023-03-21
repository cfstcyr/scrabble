/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Board, Orientation, Position } from '@app/classes/board';
import { Dictionary } from '@app/classes/dictionary';
import { PuzzleGenerator } from '@app/classes/puzzle/puzzle-generator/puzzle-generator';
import { Square } from '@app/classes/square';
import { Tile } from '@app/classes/tile';
import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
import { expect } from 'chai';
import { Container } from 'typedi';
import DictionaryService from '@app/services/dictionary-service/dictionary.service';
import { PuzzleService } from './puzzle.service';
import WordFindingPuzzle from '@app/classes/word-finding/word-finding-puzzle/word-finding-puzzle';
import { WordPlacement } from '@app/classes/word-finding';

const DEFAULT_ID_USER = 1;

const WORDS = ['a', 'aa'];

const DEFAULT_TILE_A: Tile = { letter: 'A', value: 1 };
const DEFAULT_TILE_B: Tile = { letter: 'B', value: 1 };
const DEFAULT_SQUARE_1: Square = { tile: null, position: new Position(0, 0), scoreMultiplier: null, wasMultiplierUsed: false, isCenter: false };
const BOARD: Square[][] = [
    [
        { ...DEFAULT_SQUARE_1, position: new Position(0, 0) },
        { ...DEFAULT_SQUARE_1, position: new Position(0, 1), tile: DEFAULT_TILE_A },
    ],
    [
        { ...DEFAULT_SQUARE_1, position: new Position(1, 0) },
        { ...DEFAULT_SQUARE_1, position: new Position(1, 1) },
    ],
];

describe('PuzzleService', () => {
    let service: PuzzleService;
    let testingUnit: ServicesTestingUnit;

    beforeEach(async () => {
        const dictionary = new Dictionary({ title: '', description: '', id: 'test', isDefault: true, words: WORDS });

        testingUnit = new ServicesTestingUnit()
            .withStubbed(DictionaryService, {
                getDefaultDictionary: dictionary,
                getDictionary: dictionary,
            })
            .withStubbedPrototypes(PuzzleGenerator, {
                generate: { board: new Board(BOARD), tiles: [DEFAULT_TILE_A] },
            })
            .withStubbedPrototypes(WordFindingPuzzle, { getRequiredTilesToPlace: 1 });
        await testingUnit.withMockDatabaseService();

        service = Container.get(PuzzleService);
    });

    afterEach(() => {
        testingUnit.restore();
    });

    it('should create', () => {
        expect(service).to.exist;
    });

    describe('startPuzzle', () => {
        it('should return a puzzle', () => {
            expect(service.startPuzzle(DEFAULT_ID_USER)).to.exist;
        });
    });

    describe('completePuzzle', () => {
        it('should check placement', () => {
            service.startPuzzle(DEFAULT_ID_USER);
            const result = service.completePuzzle(DEFAULT_ID_USER, {
                orientation: Orientation.Horizontal,
                startPosition: new Position(0, 0),
                tilesToPlace: [DEFAULT_TILE_A],
            });

            expect(result).to.exist;
            expect(result.targetPlacement).to.exist;
        });

        it('should throw if no game', () => {
            expect(() => service.completePuzzle(DEFAULT_ID_USER, {} as WordPlacement)).to.throw();
        });

        it('should throw if placement is invalid', () => {
            expect(() =>
                service.completePuzzle(DEFAULT_ID_USER, {
                    orientation: Orientation.Horizontal,
                    startPosition: new Position(0, 0),
                    tilesToPlace: [DEFAULT_TILE_B],
                }),
            ).to.throw();
        });
    });
});
