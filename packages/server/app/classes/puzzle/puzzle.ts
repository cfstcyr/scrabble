import { Puzzle as PuzzleCommon } from '@common/models/puzzle';
import { Board } from '@app/classes/board';

export interface Puzzle extends PuzzleCommon {
    board: Board;
}
