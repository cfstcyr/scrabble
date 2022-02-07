import { ActionPlay } from '@app/classes/actions';
import { Orientation } from '@app/classes/orientation';
import { Square } from '@app/classes/square';
import { Tile } from '@app/classes/tile';

export default class ActionPlace extends ActionPlay {
    tilesToPlace: Tile[];
    startingSquare: Square;
    orientation: Orientation;

    constructor(tilesToPlace: Tile[], startingSquare: Square, orientation: Orientation) {
        super();
        this.tilesToPlace = tilesToPlace;
        this.startingSquare = startingSquare;
        this.orientation = orientation;
    }

    execute(): void {
        throw new Error('Method not implemented.');
    }

    getMessage(): string {
        throw new Error('Method not implemented.');
    }
}
