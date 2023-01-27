import { GAME_HISTORY_PLAYER_TABLE, GAME_HISTORY_TABLE } from '@app/constants/services-constants/database-const';
import DatabaseService from '@app/services/database-service/database.service';
import { aggregate } from '@app/utils/aggregate/aggregate';
import 'mock-fs'; // required when running test. Otherwise compiler cannot resolve fs, path and __dirname
import { Service } from 'typedi';
import { GameHistory, GameHistoryPlayer, NoIdGameHistoryWithPlayers } from '@common/models/game-history';

@Service()
export default class GameHistoriesService {
    constructor(private databaseService: DatabaseService) {}

    private get table() {
        return this.databaseService.knex<GameHistory>(GAME_HISTORY_TABLE);
    }

    private get tableHistoryPlayer() {
        return this.databaseService.knex<GameHistoryPlayer>(GAME_HISTORY_PLAYER_TABLE);
    }

    async getAllGameHistories(): Promise<NoIdGameHistoryWithPlayers[]> {
        const gameHistories = await this.table
            .select('*')
            .leftJoin<GameHistoryPlayer>(
                GAME_HISTORY_PLAYER_TABLE,
                `${GAME_HISTORY_TABLE}.idGameHistory`,
                `${GAME_HISTORY_PLAYER_TABLE}.idGameHistory`,
            )
            .orderBy('endTime');

        return aggregate(gameHistories, {
            idKey: 'idGameHistory',
            fieldKey: 'playersData',
            mainItemKeys: ['startTime', 'endTime', 'gameMode', 'gameType', 'hasBeenAbandoned'],
            aggregatedItemKeys: ['name', 'score', 'isVirtualPlayer', 'isWinner'],
        });
    }

    async addGameHistory(newHistory: NoIdGameHistoryWithPlayers): Promise<void> {
        const [{ idGameHistory }] = await this.table.insert(
            {
                startTime: newHistory.startTime,
                endTime: newHistory.endTime,
                gameType: newHistory.gameType,
                gameMode: newHistory.gameMode,
                hasBeenAbandoned: newHistory.hasBeenAbandoned,
            },
            ['idGameHistory'],
        );

        await Promise.all(
            newHistory.playersData.map(
                async (playerData, i) => await this.tableHistoryPlayer.insert({ ...playerData, playerIndex: i, idGameHistory }),
            ),
        );
    }

    async resetGameHistories(): Promise<void> {
        await this.table.delete();
        await this.tableHistoryPlayer.delete();
    }
}
