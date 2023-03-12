import { Service } from 'typedi';
import DatabaseService from '@app/services/database-service/database.service';
import { User } from '@common/models/user';
import { USER_TABLE } from '@app/constants/services-constants/database-const';
import { TypeOfId } from '@common/types/id';
import { UserSearchItem, UserSearchResult } from '@common/models/user-search';
import { USER_SEARCH_LIMIT } from '@app/constants/controllers-constants';
import { HttpException } from '@app/classes/http-exception/http-exception';
import { StatusCodes } from 'http-status-codes';
import { USER_NOT_FOUND } from '@app/constants/services-errors';
import GameHistoriesService from '@app/services/game-history-service/game-history.service';
import { UserStatisticsService } from '@app/services/user-statistics-service/user-statistics-service';

@Service()
export class UserSearchService {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly gameHistoryService: GameHistoriesService,
        private readonly userStatisticsService: UserStatisticsService,
    ) {}

    async search(query: string, exclude?: TypeOfId<User>): Promise<UserSearchItem[]> {
        const sqlQuery = this.table.select('username', 'avatar').where('username', 'like', `%${query}%`).limit(USER_SEARCH_LIMIT);

        if (exclude !== undefined) sqlQuery.andWhereNot({ idUser: exclude });

        return sqlQuery;
    }

    async getUser(username: string): Promise<UserSearchResult> {
        const user = await this.table.select('idUser', 'username', 'avatar').where({ username }).first();

        if (!user) throw new HttpException(USER_NOT_FOUND, StatusCodes.NOT_FOUND);

        const [gameHistory, statistics] = await Promise.all([
            this.gameHistoryService.getGameHistory(user.idUser),
            this.userStatisticsService.getStatistics(user.idUser),
        ]);

        return {
            username: user.username,
            avatar: user.avatar,
            gameHistory,
            statistics,
        };
    }

    private get table() {
        return this.databaseService.knex<User>(USER_TABLE);
    }
}
