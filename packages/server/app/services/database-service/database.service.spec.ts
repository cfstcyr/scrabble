/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable dot-notation */
import { HIGH_SCORES_MONGO_COLLECTION_NAME } from '@app/constants/services-constants/mongo-db-const';
import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
import { fail } from 'assert';
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';
import { Document, MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createStubInstance } from 'sinon';
import { Container } from 'typedi';
import DatabaseService from './database.service';
chai.use(chaiAsPromised);

const MONGO_DATABASE_NAME = 'test';
const TEST_DOCUMENT_SMALL_ARRAY: Document[] = [{ name: 'pablito' }, { name: 'pablito' }];
const TEST_DOCUMENT_BIG_ARRAY: Document[] = [{ score: 1 }, { score: 1 }, { score: 1 }, { score: 1 }];

describe('Database service', () => {
    let databaseService: DatabaseService;
    let mongoServer: MongoMemoryServer;
    let testingUnit: ServicesTestingUnit;

    beforeEach(async () => {
        testingUnit = new ServicesTestingUnit().withStubbedDictionaryService();
        databaseService = Container.get(DatabaseService);
        mongoServer = await ServicesTestingUnit.getMongoServer();
    });

    afterEach(async () => {
        testingUnit.restore();
        if (databaseService['mongoClient']) {
            await databaseService['mongoClient'].close();
        }
    });

    // Remark : We don't test the case when MONGO_DB_URL is used in order to not connect to the real database
    it('should connect to the database when start is called', async () => {
        const mongoUri = mongoServer.getUri();
        await databaseService.connectToServer(mongoUri);
        expect(databaseService['mongoClient']).to.not.be.undefined;
        expect(databaseService['db'].databaseName).to.equal(MONGO_DATABASE_NAME);
    });

    it('should not connect to the database when start is called with wrong URL', async () => {
        databaseService['mongoClient'] = undefined as unknown as MongoClient;
        try {
            await databaseService.connectToServer('WRONG URL');
            fail();
        } catch {
            expect(databaseService['mongoClient']).to.be.undefined;
        }
        const mongoUri = mongoServer.getUri();
        await databaseService.connectToServer(mongoUri);
    });

    it('should populate the database with a helper function', async () => {
        const mongoUri = mongoServer.getUri();
        const client = await MongoClient.connect(mongoUri);
        databaseService['db'] = client.db(MONGO_DATABASE_NAME);

        await databaseService.populateDb(HIGH_SCORES_MONGO_COLLECTION_NAME, TEST_DOCUMENT_BIG_ARRAY);
        const highScores = await databaseService.database.collection(HIGH_SCORES_MONGO_COLLECTION_NAME).find({}).toArray();
        expect(highScores.length).to.equal(TEST_DOCUMENT_BIG_ARRAY.length);
    });

    it('should not populate the database with start function if it is already populated', async () => {
        const mongoUri = mongoServer.getUri();

        let client = await MongoClient.connect(mongoUri);
        databaseService['db'] = client.db(MONGO_DATABASE_NAME);
        await databaseService.populateDb(HIGH_SCORES_MONGO_COLLECTION_NAME, TEST_DOCUMENT_BIG_ARRAY);

        await databaseService.closeConnection();

        client = await MongoClient.connect(mongoUri);
        databaseService['db'] = client.db(MONGO_DATABASE_NAME);
        await databaseService.populateDb(HIGH_SCORES_MONGO_COLLECTION_NAME, TEST_DOCUMENT_SMALL_ARRAY);

        const highScores = await databaseService.database.collection(HIGH_SCORES_MONGO_COLLECTION_NAME).find({}).toArray();
        expect(highScores.length).to.equal(TEST_DOCUMENT_BIG_ARRAY.length);
    });

    it('closeConnection should call mongoClinet.close()', async () => {
        const stubMongo = createStubInstance(MongoClient);
        (databaseService['mongoClient'] as unknown) = stubMongo;

        await databaseService.closeConnection();
        expect(stubMongo.close.calledOnce).to.be.true;
    });
});
