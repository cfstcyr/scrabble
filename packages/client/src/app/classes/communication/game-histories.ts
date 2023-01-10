import { GameHistory } from '@app/classes/game-history/game-history';

export type GameHistoryData = Omit<GameHistory, 'startTime' | 'endTime'> & { startTime: string; endTime: string };

export interface GameHistoriesData {
    gameHistories: GameHistoryData[];
}
