import { GAME_HISTORY_PLAYER_TABLE, GAME_HISTORY_TABLE } from '@app/constants/services-constants/database-const';
import { GameHistory, GameHistoryPlayer, NoIdGameHistoryWithPlayers } from '@app/schemas/game-history';
import DatabaseService from '@app/services/database-service/database.service';
import { aggregate } from '@app/utils/aggregate/aggregate';
import 'mock-fs'; // required when running test. Otherwise compiler cannot resolve fs, path and __dirname
import { Service } from 'typedi';

@Service()
export default class GameHistoriesService {
    constructor(private databaseService: DatabaseService) {}

    private get db() {
        return this.databaseService.knex<GameHistory>(GAME_HISTORY_TABLE);
    }

    private get dbHistoryPlayer() {
        return this.databaseService.knex<GameHistoryPlayer>(GAME_HISTORY_PLAYER_TABLE);
    }

    async getAllGameHistories(): Promise<NoIdGameHistoryWithPlayers[]> {
        const gameHistories = await this.db
            .select('*')
            .leftJoin<GameHistoryPlayer>(GAME_HISTORY_PLAYER_TABLE, `${GAME_HISTORY_TABLE}.id`, `${GAME_HISTORY_PLAYER_TABLE}.gameHistoryId`)
            .orderBy('endTime');

        return aggregate(gameHistories, {
            idKey: 'gameHistoryId',
            fieldKey: 'playersData',
            mainItemKeys: ['startTime', 'endTime', 'gameMode', 'gameType', 'hasBeenAbandoned'],
            aggregatedItemKeys: ['name', 'score', 'isVirtualPlayer', 'isWinner'],
        });
    }

    async addGameHistory(newHistory: NoIdGameHistoryWithPlayers): Promise<void> {
        const [{ id: gameHistoryId }] = await this.db.insert(
            {
                startTime: newHistory.startTime,
                endTime: newHistory.endTime,
                gameType: newHistory.gameType,
                gameMode: newHistory.gameMode,
                hasBeenAbandoned: newHistory.hasBeenAbandoned,
            },
            ['id'],
        );

        await Promise.all(
            newHistory.playersData.map(async (playerData, i) => await this.dbHistoryPlayer.insert({ ...playerData, playerIndex: i, gameHistoryId })),
        );
    }

    async resetGameHistories(): Promise<void> {
        await this.db.delete();
    }
}
