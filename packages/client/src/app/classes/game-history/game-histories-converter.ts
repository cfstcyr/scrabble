import { GameHistoriesData, GameHistoryData } from '@app/classes/communication/game-histories';
import { GameHistory } from './game-history';

const INVERSE = -1;

export class GameHistoriesConverter {
    static convert(gameHistories: GameHistoriesData): GameHistory[] {
        return gameHistories.gameHistories.map<GameHistory>(this.convertGameHistory).sort(this.compareGameHistory);
    }

    private static convertGameHistory(gameHistoryData: GameHistoryData): GameHistory {
        return {
            ...gameHistoryData,
            startTime: new Date(gameHistoryData.startTime),
            endTime: new Date(gameHistoryData.endTime),
        };
    }

    private static compareGameHistory(gameHistoryA: GameHistory, gameHistoryB: GameHistory): number {
        return gameHistoryA.startTime < gameHistoryB.startTime ? 1 : INVERSE;
    }
}
