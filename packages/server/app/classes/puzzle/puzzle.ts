import { Tile } from '@app/classes/tile';
import { WordPlacement } from '@app/classes/word-finding';
import { Board } from '@app/classes/board';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Puzzle {
    board: Board;
    tiles: Tile[];
}

export interface PuzzleResult {
    userPoints: number;
    targetPlacement: WordPlacement;
    allPlacements: WordPlacement[];
}
