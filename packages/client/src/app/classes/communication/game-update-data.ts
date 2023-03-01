import { Square } from '@app/classes/square';
import { TileReserveData } from '@app/classes/tile/tile.types';
import { PlayerData } from './';
import { RoundData } from './round-data';

export default interface GameUpdateData {
    player1?: PlayerData;
    player2?: PlayerData;
    player3?: PlayerData;
    player4?: PlayerData;
    isGameOver?: boolean;
    winners?: string[];
    board?: Square[];
    round?: RoundData;
    tileReserve?: TileReserveData[];
}
