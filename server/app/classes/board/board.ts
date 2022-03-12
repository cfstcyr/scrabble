import { Orientation, Position, BoardNavigator } from './';
import { Tile } from '@app/classes/tile';
import { Square } from '@app/classes/square';
import { POSITION_OUT_OF_BOARD } from '@app/constants/classes-errors';
import { Vec2 } from '@app/classes/vec2';

export const SHOULD_HAVE_A_TILE = true;
export const SHOULD_HAVE_NO_TILE = false;
export default class Board {
    grid: Square[][];

    constructor(grid: Square[][]) {
        this.grid = grid;
    }
    // Verifies if the position is valid and if the square at the given position in the board has a tile or not
    verifySquare(position: Position, shouldBeFilled: boolean): boolean {
        if (position.isWithinBounds({ x: this.grid[0].length, y: this.grid.length })) {
            return this.grid[position.row][position.column].tile ? shouldBeFilled : !shouldBeFilled;
        } else {
            throw new Error(POSITION_OUT_OF_BOARD);
        }
    }

    getSquare(position: Position) {
        return this.grid[position.row][position.column];
    }

    navigate(position: Position, orientation: Orientation) {
        return new BoardNavigator(this, position, orientation);
    }

    verifyNeighbors(position: Position, orientation: Orientation, shouldBeFilled: boolean = true) {
        let backward: boolean;
        let forward: boolean;

        try {
            backward = this.verifySquare(position.copy().backward(orientation), shouldBeFilled);
        } catch (e) {
            backward = !shouldBeFilled;
        }
        try {
            forward = this.verifySquare(position.copy().forward(orientation), shouldBeFilled);
        } catch (e) {
            forward = !shouldBeFilled;
        }

        return backward || forward;
    }

    placeTile(tile: Tile, position: Position): boolean {
        if (!this.verifySquare(position, SHOULD_HAVE_NO_TILE)) return false;
        this.grid[position.row][position.column].tile = tile;
        return true;
    }

    placeWord(tiles: Tile[], startPosition: Position, orientation: Orientation): boolean {
        // eslint-disable-next-line no-console
        console.log('1');
        const actualPosition = new Position(startPosition.row, startPosition.column);
        if (tiles.length === 0 || !this.verifySquare(startPosition, SHOULD_HAVE_NO_TILE)) return false;
        const isVertical = orientation === Orientation.Vertical;
        const validatedTiles = new Map<Square, Tile>();
        let i = 0;
        while (i < tiles.length) {
            if (this.isWithinBounds(actualPosition)) return false;
            const targetSquare = this.grid[actualPosition.row][actualPosition.column];
            if (isVertical) actualPosition.row++;
            else actualPosition.column++;
            if (targetSquare.tile) {
                continue;
            } else {
                validatedTiles.set(targetSquare, tiles[i]);
                i++;
            }
        }
        for (const [square, tile] of validatedTiles) {
            square.tile = tile;
        }
        return true;
    }

    getSize(): Vec2 {
        return { x: this.grid[0].length, y: this.grid.length };
    }

    private isWithinBounds(position: Position) {
        return position.row < 0 || position.row >= this.grid.length || position.column < 0 || position.column >= this.grid[0].length;
    }
}
