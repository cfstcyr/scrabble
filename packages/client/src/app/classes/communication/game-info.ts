import { Round } from '@app/classes/round/round';
import { Square } from '@app/classes/square';
import PlayerData from './player-data';

export interface GameInfoData {
    player1: PlayerData;
    player2: PlayerData;
    isGameOver: boolean;
    board: Square[][];
    round: Round;
}
