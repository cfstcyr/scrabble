import TokenData from '@app/classes/user/token-data';
import User from '@app/classes/user/user';
import { env } from '@app/utils/environment/environment';
import knex, { Knex } from 'knex';
import { Service } from 'typedi';

@Service()
export default class DatabaseService {
    knex: Knex;

    constructor() {
        if (env.isTest) throw new Error('DatabaseService should not be used in a test environment');
    }

    async setup(): Promise<void> {
        this.knex = knex({
            client: 'pg',
            connection: {
                host: env.PG_HOST,
                port: env.PG_PORT,
                user: env.PG_USER,
                password: env.PG_PASSWORD,
                database: env.PG_DATABASE,
            },
        });

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

    async getUserId(email: string): Promise<TokenData> {
        return new Promise((resolve, reject) => {
            this.knex<User>('User')
                .where('email', email)
                .select('idUser')
                .then((data) => resolve(data[0]))
                .catch((err) => reject(err));
        });
    }

    async getUser(idUser: number): Promise<User> {
        return new Promise((resolve, reject) => {
            this.knex<User>('User')
                .where('idUser', idUser)
                .select('*')
                .then((data) => resolve(data[0]))
                .catch((err) => reject(err));
        });
    }

    async createUser(user: User): Promise<unknown> {
        return new Promise((resolve, reject) => {
            this.knex
                .returning('idUser')
                .insert(user)
                .into('User')
                .onConflict('email')
                .ignore()
                .then((data) => resolve(data[0]))
                .catch((err) => reject(err));
        });
    }
}
