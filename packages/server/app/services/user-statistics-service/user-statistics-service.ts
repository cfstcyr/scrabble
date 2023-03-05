import { HttpException } from '@app/classes/http-exception/http-exception';
import { USER_STATISTICS_TABLE } from '@app/constants/services-constants/database-const';
import { CANNOT_GET_STATISTICS_FOR_USER } from '@app/constants/services-errors';
import DatabaseService from '@app/services/database-service/database.service';
import { User } from '@common/models/user';
import { TypeOfId } from '@common/types/id';
import { Service } from 'typedi';
import { PublicUserStatistics, UserGameStatisticInfo, UserStatistics } from '@common/models/user-statistics';

@Service()
export class UserStatisticsService {
    constructor(private readonly databaseService: DatabaseService) {}

    async getStatistics(idUser: TypeOfId<User>): Promise<PublicUserStatistics> {
        let statistics = await this.tryGetStatistics(idUser);

        if (!statistics) {
            await this.createStatistics(idUser);
            statistics = await this.tryGetStatistics(idUser);
        }

        if (!statistics) throw new HttpException(CANNOT_GET_STATISTICS_FOR_USER);

        return statistics;
    }

    async addGameToStatistics(idUser: TypeOfId<User>, game: UserGameStatisticInfo): Promise<PublicUserStatistics> {
        const statistics = await this.getStatistics(idUser);

        statistics.averagePointsPerGame = this.calculateNewAveragePointsPerGame(statistics, game);
        statistics.averageTimePerGame = this.calculateNewAverageTimePerGame(statistics, game);
        statistics.gamesPlayedCount++;
        if (game.hasWon) statistics.gamesWonCount++;

        await this.table.where({ idUser }).update(statistics);

        return statistics;
    }

    async resetStatistics(idUser: TypeOfId<User>): Promise<void> {
        await this.table.where({ idUser }).update({
            averagePointsPerGame: 0,
            averageTimePerGame: 0,
            gamesPlayedCount: 0,
            gamesWonCount: 0,
        });
    }

    private async createStatistics(idUser: TypeOfId<User>): Promise<void> {
        await this.table.insert({ idUser });
    }

    private async tryGetStatistics(idUser: TypeOfId<User>): Promise<PublicUserStatistics | undefined> {
        return this.table.select('averagePointsPerGame', 'averageTimePerGame', 'gamesPlayedCount', 'gamesWonCount').where({ idUser }).first();
    }

    private calculateNewAveragePointsPerGame(statistics: PublicUserStatistics, game: UserGameStatisticInfo): number {
        return Math.round(
            statistics.averagePointsPerGame * (statistics.gamesPlayedCount / (statistics.gamesPlayedCount + 1)) +
                game.points * (1 / (statistics.gamesPlayedCount + 1)),
        );
    }

    private calculateNewAverageTimePerGame(statistics: PublicUserStatistics, game: UserGameStatisticInfo): number {
        return Math.round(
            statistics.averageTimePerGame * (statistics.gamesPlayedCount / (statistics.gamesPlayedCount + 1)) +
                game.time * (1 / (statistics.gamesPlayedCount + 1)),
        );
    }

    private get table() {
        return this.databaseService.knex<UserStatistics>(USER_STATISTICS_TABLE);
    }
}
