import { Application } from '@app/app';
import DatabaseService from '@app/services/database-service/database.service';
import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
import { StatusCodes } from 'http-status-codes';
import { MongoClient } from 'mongodb';
import { SinonStubbedInstance } from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';
import { DatabaseController } from './database.controller';

describe('DatabaseController', () => {
    let expressApp: Express.Application;
    let databaseServiceStub: SinonStubbedInstance<DatabaseService>;
    let testingUnit: ServicesTestingUnit;

    beforeEach(() => {
        testingUnit = new ServicesTestingUnit().withStubbedDictionaryService().withStubbedControllers(DatabaseController);
        databaseServiceStub = testingUnit.setStubbed(DatabaseService);
    });

    beforeEach(() => {
        expressApp = Container.get(Application).app;
    });

    afterEach(() => {
        testingUnit.restore();
    });

    describe('/api/database/is-connected', () => {
        it('should send NO_CONTENT', async () => {
            databaseServiceStub.connectToServer.resolves('client' as unknown as MongoClient);
            return supertest(expressApp).get('/api/database/is-connected').expect(StatusCodes.NO_CONTENT);
        });

        it('should send INTERNAL_SERVER_ERROR if no client', async () => {
            databaseServiceStub.connectToServer.resolves(null);
            return supertest(expressApp).get('/api/database/is-connected').expect(StatusCodes.INTERNAL_SERVER_ERROR);
        });

        it('should send INTERNAL_SERVER_ERROR if error', async () => {
            databaseServiceStub.connectToServer.rejects();
            return supertest(expressApp).get('/api/database/is-connected').expect(StatusCodes.INTERNAL_SERVER_ERROR);
        });
    });
});
