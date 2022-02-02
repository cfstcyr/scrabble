import { expect } from 'chai';
import { Board, Orientation, Position } from '@app/classes/board';
import { Tile } from '@app/classes/tile';
import { WordExtraction } from './word-extraction';
import { EXTRACTION_SQUARE_ALREADY_FILLED, EXTRACTION_POSITION_OUT_OF_BOARD, EXTRACTION_TILES_INVALID } from './word-extraction-errors';

const TILE_J: Tile = { letter: 'J', value: 1 };
const TILE_A: Tile = { letter: 'A', value: 1 };
const TILE_M: Tile = { letter: 'M', value: 1 };
const TILE_B: Tile = { letter: 'B', value: 1 };
const TILE_O: Tile = { letter: 'O', value: 1 };
const TILE_N: Tile = { letter: 'N', value: 1 };
// const TILE_S: Tile = { letter: 'N', value: 1 };

const WORD_JAMBON: Tile[] = [TILE_J, TILE_A, TILE_M, TILE_B, TILE_O, TILE_N];
// const WORD_NON: Tile[] = [TILE_N, TILE_O, TILE_N];
// const WORD_MA: Tile[] = [TILE_M, TILE_A];
const WORD_BON: Tile[] = [TILE_B, TILE_O, TILE_N];

// const getTilesPlaced = (board: Board, tilesPlaced: Tile[], startPosition: Position, orientation: Orientation): Square[] => {
//     const locationWord: Square[] = [];
//     for (let i = 0; i < locationWord.length; i++) {
//         if (orientation === Orientation.Vertical) locationWord.push(board.grid[startPosition.row + i][startPosition.col]);
//         if (orientation === Orientation.Horizontal) locationWord.push(board.grid[startPosition.row][startPosition.col + i]);
//     }
//     return locationWord;
// };

describe('WordExtraction', () => {
    let wordExtraction: WordExtraction;
    let board: Board;
    beforeEach(async () => {
        wordExtraction = new WordExtraction();
        board = new Board();
    });
    // let board: Board;

    /* eslint-disable no-console */

    /* eslint-disable @typescript-eslint/no-magic-numbers */
    /* eslint-disable @typescript-eslint/no-unused-expressions */
    /* eslint-disable no-unused-expressions */
    it('should create', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions, no-unused-expressions
        expect(wordExtraction).to.exist;
    });

    it('should throw an EXTRACTION_POSITION_OUT_OF_BOARD when the board grid is an empty array', () => {
        const startPosition: Position = { row: 1, col: 7 };
        const orientation = Orientation.Vertical;
        board.grid = [[]];
        const result = () => wordExtraction.extract(board, WORD_JAMBON, startPosition, orientation);
        expect(result).to.throw(EXTRACTION_POSITION_OUT_OF_BOARD);
    });

    it('should throw an EXTRACTION_TILES_INVALID when the TilesToPlace is empty', () => {
        const startPosition = { row: 1, col: 12 };
        const orientation = Orientation.Vertical;
        const result = () => wordExtraction.extract(board, [], startPosition, orientation);
        expect(result).to.throw(EXTRACTION_TILES_INVALID);
    });

    it('should throw an EXTRACTION_TILES_INVALID when the TilesToPlace is too big', () => {
        const startPosition = { row: 1, col: 12 };
        const orientation = Orientation.Vertical;
        const BIG_WORD = WORD_JAMBON.concat(WORD_JAMBON).concat(WORD_JAMBON);
        const result = () => wordExtraction.extract(board, BIG_WORD, startPosition, orientation);
        expect(result).to.throw(EXTRACTION_TILES_INVALID);
    });

    it('should throw an EXTRACTION_SQUARE_ALREADY_FILLED when the TileToPlace is too big', () => {
        const startPosition = { row: 1, col: 12 };
        board.grid[startPosition.row][startPosition.col].tile = TILE_O;
        const orientation = Orientation.Vertical;
        const result = () => wordExtraction.extract(board, WORD_JAMBON, startPosition, orientation);
        expect(result).to.throw(EXTRACTION_SQUARE_ALREADY_FILLED);
    });

    it('should return the word generated by the TilesToPlace when the board is empty', () => {
        const startPosition: Position = { row: 1, col: 7 };
        const orientation = Orientation.Vertical;
        console.log(wordExtraction.extract(board, WORD_JAMBON, startPosition, orientation));
        expect(wordExtraction.extract(board, WORD_JAMBON, startPosition, orientation)).to.equal([['JAMBON']]);
    });

    it('should return the word generated by the TilesToPlace when the board already has a word', () => {
        const startPosition: Position = { row: 1, col: 7 };
        const orientation = Orientation.Horizontal;
        board.placeTile(TILE_O, { row: startPosition.row, col: startPosition.col + 1 });
        expect(wordExtraction.extract(board, WORD_JAMBON, startPosition, orientation)).to.equal([['JOAMBON']]);
    });

    it('should return a the list of words created when it creates many words', () => {
        const jambonPosition = { row: 0, col: 0 };
        const jambonOrientation = Orientation.Horizontal;
        board.placeWord(WORD_JAMBON, jambonPosition, jambonOrientation);
        const bonPosition = { row: 2, col: 2 };
        const bonOrientation = Orientation.Vertical;
        board.placeWord(WORD_BON, bonPosition, bonOrientation);
        const startPosition: Position = { row: 1, col: 2 };
        const orientation = Orientation.Horizontal;
        const expected = ['MJBON', 'BA', 'OM', 'NB', 'JAMBON'];
        expect(wordExtraction.extract(board, WORD_JAMBON, startPosition, orientation)).to.equal(expected);
    });

    it('should return a the list of words created when it creates many words', () => {
        const jambonPosition = { row: 0, col: 0 };
        const jambonOrientation = Orientation.Horizontal;
        board.placeWord(WORD_JAMBON, jambonPosition, jambonOrientation);
        const bonPosition = { row: 1, col: 2 };
        const bonOrientation = Orientation.Vertical;
        board.placeWord(WORD_BON, bonPosition, bonOrientation);
        const startPosition: Position = { row: 1, col: 3 };
        const orientation = Orientation.Vertical;
        const expected = ['BJ', 'OA', 'NM', 'BJAMBON'];
        expect(wordExtraction.extract(board, WORD_JAMBON, startPosition, orientation)).to.equal(expected);
    });

    it('place Tile should place a Tile and return true at the desired Square', () => {
        // const targetPosition = { row: 5, col: 3 };
        // expect(board.placeTile(DEFAULT_TILE_A, targetPosition)).to.be.true;
        // expect(validateTile(board.grid[targetPosition.row][targetPosition.col].tile, DEFAULT_TILE_A)).to.be.true;
    });
});
