import { Orientation, Position } from './';
import { Tile } from '@app/classes/tile';
import Square from './square';

export default class Board {
    grid: Square[][];

    /* eslint-disable @typescript-eslint/no-magic-numbers */
    // TODO: Change to correct
    constructor() {
        this.grid = [];
        for (let i = 0; i < 15; i++) {
            this.grid[i] = [];
            for (let j = 0; j < 15; j++) {
                const square = {
                    tile: undefined,
                    multiplier: 1,
                    multiplierType: undefined,
                    played: false,
                    row: i,
                    column: j,
                };
                this.grid[i][j] = square;
            }
        }
    }

    placeTile(tile: Tile, position: Position): boolean {
        // TODO: Change to cosntant form thom
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        if (position.col < 0 || position.col >= 15 || position.row < 0 || position.row >= 15) return false;
        const targetSquare = this.grid[position.row][position.col];
        if (targetSquare.tile) return false;
        targetSquare.tile = tile;
        return true;
    }

    placeWord(tiles: Tile[], startPosition: Position, orientation: Orientation): boolean {
        const actualPosition = startPosition;
        if (tiles.length === 0) return false;
        const isVertical = orientation === Orientation.Vertical;
        const validatedTiles = new Map<Square, Tile>();
        let i = 0;
        while (i < tiles.length) {
            // TODO: Change to cosntant form thom
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            if (actualPosition.col < 0 || actualPosition.col >= 15 || actualPosition.row < 0 || actualPosition.row >= 15) return false;
            const targetSquare = this.grid[actualPosition.row][actualPosition.col];
            if (isVertical) actualPosition.row++;
            else actualPosition.col++;
            if (targetSquare.tile) continue;
            else {
                validatedTiles.set(targetSquare, tiles[i]);
                i++;
            }
        }
        for (const [square, tile] of validatedTiles) {
            square.tile = tile;
            // eslint-disable-next-line no-console
            console.log(square);
        }
        return true;
    }
}
