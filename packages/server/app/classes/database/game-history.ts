import { GameMode } from '@app/classes/game/game-mode';
import { GameType } from '@app/classes/game/game-type';

export interface GameHistory {
    startTime: Date;
    endTime: Date;
    player1Data: PlayerHistoryData;
    player2Data: PlayerHistoryData;
    gameType: GameType;
    gameMode: GameMode;
    hasBeenAbandoned: boolean;
}

export interface PlayerHistoryData {
    name: string;
    score: number;
    isVirtualPlayer: boolean;
    isWinner: boolean;
}
