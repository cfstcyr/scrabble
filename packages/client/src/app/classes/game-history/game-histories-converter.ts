import { GameHistoriesData, GameHistoryData } from '@app/classes/communication/game-histories';
import { GameHistoryWithPlayers } from '@common/models/game-history';
import { NoId } from '@common/types/id';

const INVERSE = -1;

export class GameHistoriesConverter {
    static convert(gameHistories: NoId<GameHistoriesData>): NoId<GameHistoryWithPlayers>[] {
        return gameHistories.gameHistories.map<NoId<GameHistoryWithPlayers>>(this.convertGameHistory).sort(this.compareGameHistory);
    }

    private static convertGameHistory(gameHistoryData: NoId<GameHistoryData>): NoId<GameHistoryWithPlayers> {
        return {
            ...gameHistoryData,
            startTime: new Date(gameHistoryData.startTime),
            endTime: new Date(gameHistoryData.endTime),
        };
    }

    private static compareGameHistory(gameHistoryA: NoId<GameHistoryWithPlayers>, gameHistoryB: NoId<GameHistoryWithPlayers>): number {
        return gameHistoryA.startTime < gameHistoryB.startTime ? 1 : INVERSE;
    }
}
