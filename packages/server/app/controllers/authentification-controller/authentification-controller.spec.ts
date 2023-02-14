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
        testingUnit.withStubbedControllers(AuthentificationService);
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

        describe('POST /authentification/login', () => {
            it('should return 200 on successful login', async () => {
                chai.spy.on(authentificationServiceStub, 'login', async () => 'OK');

                return supertest(expressApp)
                    .post('/api/authentification/login')
                    .send({ email: 'admin@admin.com', password: 'password' })
                    .set('Accept', 'application/json')
                    .expect(StatusCodes.OK);
            });

            it('should return 400 on failed login', async () => {
                chai.spy.on(authentificationServiceStub, 'login', async () => {
                    throw new HttpException('NOT FOUND', StatusCodes.NOT_FOUND);
                });
                return supertest(expressApp)
                    .post('/api/authentification/login')
                    .send({ email: '', password: '' })
                    .set('Accept', 'application/json')
                    .expect(StatusCodes.BAD_REQUEST);
            });
        });

        describe('POST /authentification/signUp', () => {
            it('should return 200 on successful signup', async () => {
                chai.spy.on(authentificationServiceStub, 'signUp', async () => 'OK');

                return supertest(expressApp)
                    .post('/api/authentification/signUp')
                    .send({ email: 'admin@admin.com', password: 'password', username: 'admin' })
                    .set('Accept', 'application/json')
                    .expect(StatusCodes.OK);
            });

            it('should return 403 on failed signup', async () => {
                chai.spy.on(authentificationServiceStub, 'signUp', async () => {
                    throw new HttpException('NOT FOUND', StatusCodes.NOT_FOUND);
                });
                return supertest(expressApp)
                    .post('/api/authentification/signUp')
                    .send({ email: 'admin', password: 'password', username: 'username' })
                    .expect(StatusCodes.FORBIDDEN);
            });
        });
        describe('POST /authentification/validate', () => {
            it('validate should return 401', async () => {
                return supertest(expressApp).post('/api/authentification/validate').expect(StatusCodes.UNAUTHORIZED);
            });

            it('validateUsername should return 403', async () => {
                chai.spy.on(authentificationServiceStub, 'validateUsername', async () => {
                    throw new HttpException('USER FOUND');
                });

                return supertest(expressApp).post('/api/authentification/validateUsername').send({ username: 'admin' }).expect(StatusCodes.FORBIDDEN);
            });

            it('validateUsername should return 200', async () => {
                chai.spy.on(authentificationServiceStub, 'validateUsername', async () => 'OK');

                return supertest(expressApp).post('/api/authentification/validateUsername').send({ username: 'XXXX' }).expect(StatusCodes.OK);
            });

            it('validateEmail should return 403', async () => {
                chai.spy.on(authentificationServiceStub, 'validateEmail', async () => {
                    throw new HttpException('USER FOUND');
                });

                return supertest(expressApp)
                    .post('/api/authentification/validateEmail')
                    .send({ email: 'admin@admin.com' })
                    .expect(StatusCodes.FORBIDDEN);
            });

            it('validateEmail should return 200', async () => {
                chai.spy.on(authentificationServiceStub, 'validateEmail', async () => true);

                return supertest(expressApp).post('/api/authentification/validateEmail').send({ email: 'XXXX' }).expect(StatusCodes.OK);
            });

            it('validateEmail should return true in the body', async () => {
                chai.spy.on(authentificationServiceStub, 'validateEmail', async () => true);
                const body = (await supertest(expressApp).post('/api/authentification/validateEmail').send({ email: 'XXX@admin.com' })).body;

                expect(body).to.deep.equal({
                    isAvailable: true,
                });
            });

            it('validateEmail should return false in the body', async () => {
                chai.spy.on(authentificationServiceStub, 'validateEmail', async () => false);

                expect(
                    (await supertest(expressApp).post('/api/authentification/validateEmail').send({ email: 'admin@admin.com' })).body,
                ).to.deep.equal({
                    isAvailable: false,
                });
            });
        });
    });
});
