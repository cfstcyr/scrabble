import { Square } from '@app/classes/square';
import { Tile } from '@app/classes/tile';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Puzzle {
    board: Square[][];
    tiles: Tile[];
}
