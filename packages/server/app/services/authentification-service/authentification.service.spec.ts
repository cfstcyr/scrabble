/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { User } from '@common/models/user';
import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import { SinonStubbedInstance } from 'sinon';
import { Container } from 'typedi';
import DatabaseService from '@app/services/database-service/database.service';
import { AuthentificationService } from './authentification.service';
import * as bcrypt from 'bcryptjs';

const expect = chai.expect;
chai.use(spies);
chai.use(chaiAsPromised);

const ADMIN_USER: User = { username: 'admin', password: 'admin', email: 'admin@admin.com', idUser: 1 };

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
    });

    it('should login the admin', () => {
        const admin = { email: 'admin@admin.com', password: 'admin' };
        expect(authentificationService.login(admin)).to.exist;
    });

    it('signUp should call createUser method from databaseService', () => {
        const spy = chai.spy.on(databaseServiceStub, 'createUser', () => { });
        authentificationService.signUp(ADMIN_USER);
        expect(spy).to.have.been.called;
    });

    it('login should call getUser method from databaseService', () => {
        const spy = chai.spy.on(databaseServiceStub, 'getUser', () => { });
        authentificationService.login(ADMIN_USER);
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

    describe('login', () => {

        describe('HAPPY PATH', () => {
            it('should return access token on password match', async () => {
                const expectedAccessToken = 'ACCESS';
                chai.spy.on(databaseServiceStub, 'getUser', () => ADMIN_USER);
                chai.spy.on(authentificationService, 'generateAccessToken', () => expectedAccessToken);
                chai.spy.on(bcrypt, 'compare', () => true);

                expect(authentificationService.login(ADMIN_USER)).to.eventually.equal(expectedAccessToken);
            });
        });

        describe('SAD PATH', () => {
            it('should NOT return access token on password match', async () => {
                chai.spy.on(databaseServiceStub, 'getUser', () => ADMIN_USER);
                chai.spy.on(bcrypt, 'compare', () => false);

                expect(authentificationService.login(ADMIN_USER)).to.eventually.not.exist;
            });
        });
    });
});
