import { UserId } from '@app/classes/user/connected-user-types';
import { ANALYSIS_TABLE } from '@app/constants/services-constants/database-const';
import { Service } from 'typedi';
import DatabaseService from '@app/services/database-service/database.service';

@Service()
export class AnalysisPersistenceService {
    constructor(private readonly databaseService: DatabaseService) {}

    async requestAnalysis(gameId: string, userId: UserId) {
        return this.analysisTable.select('*').where({ gameId, userId });
    }

    async addAnalysis(gameId: string, userId: UserId) {
        // return this.analysisTable.select('*').where({ gameId, userId });
    }

    private get analysisTable() {
        return this.databaseService.knex<AnalysisPersistenceService>(ANALYSIS_TABLE);
    }
}
