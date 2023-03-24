import { Tile, Board } from './game';
import { ScoredWordPlacement } from './word-finding';

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
    targetPlacement: ScoredWordPlacement;
    allPlacements: ScoredWordPlacement[];
}

export type PuzzleResultSolution = Pick<PuzzleResult, 'targetPlacement' | 'allPlacements'>;