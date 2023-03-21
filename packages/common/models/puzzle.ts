import { Tile, Board } from './game';
import { WordPlacement } from './word-finding';

export interface Puzzle {
    board: Board;
    tiles: Tile[];
}

export enum PuzzleResultStatus {
    Won = 'won',
    Valid = 'valid',
    Invalid = 'invalid',
    Abandoned = 'abandoned',
}

export interface PuzzleResult {
    userPoints: number;
    result: PuzzleResultStatus;
    targetPlacement: WordPlacement;
    allPlacements: WordPlacement[];
}
