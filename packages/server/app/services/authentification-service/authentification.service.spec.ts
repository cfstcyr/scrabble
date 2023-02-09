/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { UserDatabase } from '@common/models/user';
import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import { SinonStubbedInstance } from 'sinon';
import { Container } from 'typedi';
import DatabaseService from '@app/services/database-service/database.service';
import { AuthentificationService } from './authentification.service';
import * as bcryptjs from 'bcryptjs';
import { NO_LOGIN } from '@app/constants/controllers-errors';

const expect = chai.expect;
chai.use(spies);
chai.use(chaiAsPromised);

const ADMIN_USER: UserDatabase = { username: 'admin', password: 'admin', email: 'admin@admin.com', idUser: 1 };

describe('AuthentificationService', () => {
    let testingUnit: ServicesTestingUnit;
    let authentificationService: AuthentificationService;
    let databaseServiceStub: SinonStubbedInstance<DatabaseService>;

    beforeEach(async () => {
        testingUnit = new ServicesTestingUnit();
        await testingUnit.withMockDatabaseService();
    });

    beforeEach(() => {
        authentificationService = Container.get(AuthentificationService);
        databaseServiceStub = testingUnit.setStubbed(DatabaseService);
    });

    afterEach(() => {
        testingUnit.restore();
        chai.spy.restore();
    });

    it('should be defined', () => {
        expect(authentificationService);
        expect(authentificationService.connectedUsers).to.exist;
    });

    it('signUp should call createUser method from databaseService', () => {
        const spy = chai.spy.on(databaseServiceStub, 'createUser', () => { });
        authentificationService.signUp(ADMIN_USER);
        expect(spy).to.have.been.called;
    });

    it('validateEmail should return true with a unused email', async () => {
        const email = 'XXXXXX@admin.com';
        expect(await authentificationService.validateEmail(email)).to.be.true;
    });

    it('validateUsername should return true with a unused username', async () => {
        const username = 'XXXXXXX';
        expect(await authentificationService.validateUsername(username)).to.be.true;
    });

    it('login should call generateAccessToken if match', () => {
        chai.spy.on(bcryptjs, 'compare', () => true);
        expect(authentificationService.login(ADMIN_USER)).to.eventually.equal(authentificationService['generateAccessToken']);

    });
    it('should throw new Error(NO_LOGIN) when no match', () => {
        chai.spy.on(bcryptjs, 'compare', () => true);
        expect(authentificationService.login(ADMIN_USER)).to.eventually.throw(new Error(NO_LOGIN));
    });

    it('should login the admin', () => {
        const admin = { email: 'admin@admin.com', password: 'admin', username: 'admin' };
        expect(authentificationService.login(admin)).to.exist;
    });

    it('login should call getUser method from databaseService', () => {
        const spy = chai.spy.on(databaseServiceStub, 'getUser', () => { });
        authentificationService.login(ADMIN_USER);
        expect(spy).to.have.been.called;
    });

    describe('HAPPY PATH', () => {
        it('should return access token on password match', async () => {
            const expectedAccessToken = 'ACCESS';
            chai.spy.on(databaseServiceStub, 'getUser', () => ADMIN_USER);
            chai.spy.on(authentificationService, 'generateAccessToken', () => expectedAccessToken);
            chai.spy.on(bcryptjs, 'compare', () => true);

            expect(authentificationService.login(ADMIN_USER)).to.eventually.equal(expectedAccessToken);
        });
    });

    describe('SAD PATH', () => {
        it('should NOT return access token on password match', async () => {
            chai.spy.on(databaseServiceStub, 'getUser', () => ADMIN_USER);
            chai.spy.on(bcryptjs, 'compare', () => false);

            expect(authentificationService.login(ADMIN_USER)).to.eventually.not.exist;
        });
    });
});
