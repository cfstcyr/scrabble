import { GameHistoriesData, GameHistoryData } from '@app/classes/communication/game-histories';
import { GameHistoryWithPlayers } from '@common/models/game-history';

const INVERSE = -1;

export class GameHistoriesConverter {
    static convert(gameHistories: GameHistoriesData): GameHistoryWithPlayers[] {
        return gameHistories.gameHistories.map<GameHistoryWithPlayers>(this.convertGameHistory).sort(this.compareGameHistory);
    }

    private static convertGameHistory(gameHistoryData: GameHistoryData): GameHistoryWithPlayers {
        return {
            ...gameHistoryData,
            startTime: new Date(gameHistoryData.startTime),
            endTime: new Date(gameHistoryData.endTime),
        };
    }

    private static compareGameHistory(gameHistoryA: GameHistoryWithPlayers, gameHistoryB: GameHistoryWithPlayers): number {
        return gameHistoryA.startTime < gameHistoryB.startTime ? 1 : INVERSE;
    }
}
