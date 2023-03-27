import { GAME_HISTORY_PLAYER_TABLE, GAME_HISTORY_TABLE } from '@app/constants/services-constants/database-const';
import DatabaseService from '@app/services/database-service/database.service';
import 'mock-fs'; // required when running test. Otherwise compiler cannot resolve fs, path and __dirname
import { Service } from 'typedi';
import { GameHistory, GameHistoryCreation, GameHistoryForUser, GameHistoryPlayer } from '@common/models/game-history';
import { TypeOfId } from '@common/types/id';
import { User } from '@common/models/user';

@Service()
export default class GameHistoriesService {
    constructor(private databaseService: DatabaseService) {}

    private get table() {
        return this.databaseService.knex<GameHistory>(GAME_HISTORY_TABLE);
    }

    private get tableHistoryPlayer() {
        return this.databaseService.knex<GameHistoryPlayer>(GAME_HISTORY_PLAYER_TABLE);
    }

    async addGameHistory({ gameHistory, players }: GameHistoryCreation): Promise<TypeOfId<GameHistory>> {
        const [{ idGameHistory }] = await this.table.insert(gameHistory, ['idGameHistory']);

        await Promise.all(players.map((player) => this.tableHistoryPlayer.insert({ ...player, idGameHistory })));
        return idGameHistory;
    }

    async getGameHistory(idUser: TypeOfId<User>): Promise<GameHistoryForUser[]> {
        return await this.table
            .select('startTime', 'endTime', 'hasBeenAbandoned', 'score', 'isWinner')
            .leftJoin<GameHistoryPlayer>(
                GAME_HISTORY_PLAYER_TABLE,
                `${GAME_HISTORY_TABLE}.idGameHistory`,
                `${GAME_HISTORY_PLAYER_TABLE}.idGameHistory`,
            )
            .where({ idUser })
            .orderBy('startTime', 'desc');
    }

    async resetGameHistories(): Promise<void> {
        await this.table.delete();
        await this.tableHistoryPlayer.delete();
    }
}
