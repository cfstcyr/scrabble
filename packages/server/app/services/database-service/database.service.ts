import { env } from '@app/utils/environment/environment';
import knex, { Knex } from 'knex';
import { Collection, Db, Document, MongoClient } from 'mongodb';
import { Service } from 'typedi';

@Service()
export default class DatabaseService {
    readonly knex: Knex;
    private mongoClient: MongoClient;
    private db: Db;

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

    async populateDb(collectionName: string, data: Document[]): Promise<void> {
        const collection = this.db.collection(collectionName);
        if (await this.isCollectionEmpty(collection)) {
            await collection.insertMany(data);
        }
    }

    async connectToServer(databaseUrl: string = env.MONGO_URL): Promise<MongoClient | null> {
        try {
            const client = await MongoClient.connect(databaseUrl);
            this.mongoClient = client;
            this.db = this.mongoClient.db(env.MONGO_NAME);
        } catch (exception) {
            return null;
        }
        return this.mongoClient;
    }

    async closeConnection(): Promise<void> {
        return this.mongoClient ? this.mongoClient.close() : Promise.resolve();
    }

    get database(): Db {
        return this.db;
    }

    async isCollectionEmpty(collection: Collection<Document>): Promise<boolean> {
        return (await collection.countDocuments({})) === 0;
    }
}
