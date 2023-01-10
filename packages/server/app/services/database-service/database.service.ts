import { env } from '@app/utils/environment/environment';
import { Collection, Db, Document, MongoClient } from 'mongodb';
import { Service } from 'typedi';

@Service()
export default class DatabaseService {
    private mongoClient: MongoClient;
    private db: Db;

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
