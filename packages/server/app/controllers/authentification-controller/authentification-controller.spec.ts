/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { AuthentificationService } from '@app/services/authentification-service/authentification.service';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import { AuthentificationController } from './authentification-controller';
import * as sinon from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';
import { Application } from '@app/app';
import { StatusCodes } from 'http-status-codes';
import { HttpException } from '@app/classes/http-exception/http-exception';
import { SinonStubbedInstance } from 'sinon';
import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';

const expect = chai.expect;
chai.use(spies);
chai.use(chaiAsPromised);

describe('AuthentificationController', () => {
    let controller: AuthentificationController;
    let authentificationServiceStub: SinonStubbedInstance<AuthentificationService>;
    let testingUnit: ServicesTestingUnit;

    beforeEach(async () => {
        testingUnit = new ServicesTestingUnit();
        await testingUnit.withMockDatabaseService();
        testingUnit.withStubbedDictionaryService().withStubbedControllers(AuthentificationService);
        authentificationServiceStub = testingUnit.setStubbed(AuthentificationService);
        controller = Container.get(AuthentificationController);
    });

    afterEach(() => {
        sinon.restore();
        chai.spy.restore();
        testingUnit.restore();
    });

    it('should be defined', () => {
        expect(controller).to.exist;
    });

    describe('configureRouter', () => {
        let expressApp: Express.Application;

        beforeEach(() => {
            const app = Container.get(Application);
            expressApp = app.app;
        });

        it('should call authentificationService.login', async () => {
            return supertest(expressApp)
                .post('api/authentification/login')
                .send({ email: 'admin@admin.com', password: 'password' })
                .set('Accept', 'application/json')
                .expect(StatusCodes.OK);
        });

        it('should return 200', async () => {
            return supertest(expressApp)
                .post('api/authentification/signUp')
                .send({ email: 'admin@admin.com', password: 'password', username: 'admin' })
                .set('Accept', 'application/json')
                .expect(StatusCodes.OK);
        });

        it('login should return 401', async () => {
            chai.spy.on(authentificationServiceStub, 'login', async () => {
                throw new HttpException('NOT FOUND', StatusCodes.NOT_FOUND);
            });
            return supertest(expressApp)
                .post('api/authentification/signUp')
                .send({ email: '', password: '' })
                .set('Accept', 'application/json')
                .expect(StatusCodes.NOT_FOUND);
        });

        it('signUp should return 401', async () => {
            chai.spy.on(authentificationServiceStub, 'signUp', async () => {
                throw new HttpException('NOT FOUND', StatusCodes.NOT_FOUND);
            });
            return supertest(expressApp)
                .post('api/authentification/signUp')
                .send({ email: 'admin', password: 'password', username: 'username' })
                .expect(StatusCodes.NOT_FOUND);
        });
    });
});
