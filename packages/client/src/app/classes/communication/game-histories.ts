import { GameHistoryWithPlayers } from "@common/models/game-history";

export type GameHistoryData = Omit<GameHistoryWithPlayers, 'startTime' | 'endTime'> & { startTime: string; endTime: string };

export interface GameHistoriesData {
    gameHistories: GameHistoryData[];
}
