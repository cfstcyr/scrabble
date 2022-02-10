import { Square } from '@app/classes/square';
import { Round } from '@app/classes/round/round';
import { PlayerData } from './player-data';

export interface GameUpdateData {
    player1?: PlayerData;
    player2?: PlayerData;
    isGameOver?: boolean;
    board?: (Square | undefined)[][];
    round?: Round;
}
