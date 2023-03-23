import { Multiplier as MultiplierCommon, Square as SquareCommon } from '@common/models/game';
import { Position } from '@app/classes/board';

export type Multiplier = MultiplierCommon;

// type Square = SquareCommon;
export default interface Square extends SquareCommon {
    position: Position;
}
