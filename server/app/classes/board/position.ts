import { Vec2 } from '@app/classes/board/vec2';
import { DEFAULT_DISTANCE } from '@app/constants/position-constants';
import { Orientation } from '.';
import Direction from './direction';

export default class Position {
    constructor(public row: number, public column: number) {}

    forward(orientation: Orientation, distance: number = DEFAULT_DISTANCE): Position {
        this.move(orientation, Direction.Forward, distance);
        return this;
    }

    backward(orientation: Orientation, distance: number = DEFAULT_DISTANCE): Position {
        this.move(orientation, Direction.Backward, distance);
        return this;
    }

    move(orientation: Orientation, direction: Direction, distance: number = DEFAULT_DISTANCE): Position {
        if (orientation === Orientation.Horizontal) this.column += direction * distance;
        else this.row += direction * distance;
        return this;
    }

    copy(): Position {
        return new Position(this.row, this.column);
    }

    isWithinBounds(size: Vec2): boolean {
        return this.column >= 0 && this.column < size.x && this.row >= 0 && this.row < size.y;
    }
}
