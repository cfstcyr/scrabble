import { GameMode } from '@app/constants/game-mode';
import { GameType } from '@app/constants/game-type';

export interface GameHistory {
    startTime: Date;
    endTime: Date;
    playersData: PlayerHistoryData[];
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
