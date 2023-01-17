import { newDb } from 'pg-mem';
import { Service } from 'typedi';
import DatabaseService from './database.service';

@Service()
export default class TestingDatabaseService extends DatabaseService {
    async setup(): Promise<void> {
        const db = newDb();
        this.knex = db.adapters.createKnex();
        await this.knex.migrate.latest();
    }
}
