import { Position } from '@app/classes/board';
import { Tile } from '@app/classes/tile';
import ScoreMultiplier from './score-multiplier';

export type Multiplier = ScoreMultiplier | null;
export default interface Square {
    tile: Tile | null;
    position: Position;
    scoreMultiplier: Multiplier;
    wasMultiplierUsed: boolean;
    isCenter: boolean;
}
