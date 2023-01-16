import { env } from '@app/utils/environment/environment';
import knex, { Knex } from 'knex';
import { Service } from 'typedi';

@Service()
export default class DatabaseService {
    readonly knex: Knex;

    constructor() {
        this.knex = knex({
            client: 'pg',
            connection: {
                host: env.PG_HOST,
                port: env.PG_PORT,
                user: env.PG_USER,
                password: env.PG_USER,
                database: env.PG_DATABASE,
            },
        });
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
