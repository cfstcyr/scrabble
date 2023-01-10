import { Square } from '@app/classes/square';
import { TileReserveData } from '@app/classes/tile/tile.types';
import { GameObjectivesData } from './objective-data';
import { PlayerData } from './player-data';
import { RoundData } from './round-data';

export interface GameUpdateData {
    player1?: PlayerData;
    player2?: PlayerData;
    isGameOver?: boolean;
    winners?: string[];
    board?: (Square | undefined)[];
    round?: RoundData;
    tileReserve?: TileReserveData[];
    gameObjective?: GameObjectivesData;
}
