import { Orientation, Position } from '@app/classes/board';
import { PointRange } from '@app/classes/word-finding';

export const TEST_MINIMUM_VALUE = 0;
export const TEST_MAXIMUM_VALUE = 42;
export const RANDOM_VALUE_LOW = 0.1;
export const RANDOM_VALUE_MEDIUM = 0.5;
export const RANDOM_VALUE_HIGH = 0.9;
export const RANDOM_VALUE_PASS = 0.05;
export const RANDOM_VALUE_EXCHANGE = 0.15;
export const RANDOM_VALUE_PLACE = 0.5;
export const GAME_ID = 'testGameId';
export const PLAYER_ID = 'testPlayerId';
export const PLAYER_NAME = 'ElScrabblo';
export const TEST_SCORE = 69;
export const TEST_ORIENTATION = Orientation.Horizontal;
export const TEST_START_POSITION: Position = new Position(1, 1);
export const EXPECTED_INCREMENT_VALUE = 1;
export const TEST_COUNT_VALUE = 13;
export const TEST_POINT_RANGE: PointRange = {
    minimum: TEST_MINIMUM_VALUE,
    maximum: TEST_MAXIMUM_VALUE,
};
