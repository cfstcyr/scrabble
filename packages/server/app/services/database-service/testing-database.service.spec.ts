import { Knex } from 'knex';
import { newDb } from 'pg-mem';
import { Service } from 'typedi';

@Service()
export default class TestingDatabaseService {
    readonly knex: Knex;

    constructor() {
        const db = newDb();
        this.knex = db.adapters.createKnex();
    }

    async configure() {
        await this.knex.migrate.latest();
    }

    async pingDb(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.knex
                .raw('SELECT 1')
                .then(() => resolve())
                .catch(reject);
        });
    }
}
