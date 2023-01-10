import { Orientation } from '@app/classes/actions/orientation';
import { Position } from '@app/classes/board-navigator/position';
import { SquareView } from '@app/classes/square';
import Direction from './direction';

export class BoardNavigator {
    orientation: Orientation;
    private position: Position;
    private squareGrid: SquareView[][];

    constructor(squareGrid: SquareView[][], position: Position, orientation: Orientation) {
        this.squareGrid = squareGrid;
        this.position = { ...position };
        this.orientation = orientation;
    }

    get row(): number {
        return this.position.row;
    }

    get column(): number {
        return this.position.column;
    }

    get currentSquareView(): SquareView {
        return this.squareGrid[this.position.row][this.position.column];
    }

    setPosition(position: Position): void {
        this.position = { ...position };
    }

    nextEmpty(direction: Direction, allowNotApplied: boolean): SquareView | undefined {
        return this.moveUntil(direction, () => this.isEmpty(allowNotApplied));
    }

    switchOrientation(): BoardNavigator {
        this.orientation = this.orientation === Orientation.Horizontal ? Orientation.Vertical : Orientation.Horizontal;
        return this;
    }

    clone(): BoardNavigator {
        return new BoardNavigator(this.squareGrid, this.position, this.orientation);
    }

    private move(direction: Direction, distance: number = 1): BoardNavigator {
        if (this.orientation === Orientation.Horizontal) {
            this.position.column += direction * distance;
        } else {
            this.position.row += direction * distance;
        }
        return this;
    }

    private moveUntil(direction: Direction, predicate: () => boolean): SquareView | undefined {
        do {
            this.move(direction);
        } while (this.isWithinBounds() && !predicate());

        return this.isWithinBounds() ? this.currentSquareView : undefined;
    }

    private isWithinBounds(): boolean {
        return (
            this.position.row >= 0 &&
            this.position.column >= 0 &&
            this.position.row < this.squareGrid.length &&
            this.position.column < this.squareGrid[this.position.row].length
        );
    }

    private isEmpty(allowNotApplied: boolean = false): boolean {
        return this.currentSquareView.square.tile === null || (allowNotApplied && !this.currentSquareView.applied);
    }
}
