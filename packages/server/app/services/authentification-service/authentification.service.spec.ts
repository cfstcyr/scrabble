/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import User from '@app/classes/user/user';
import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import { SinonStubbedInstance } from 'sinon';
import { Container } from 'typedi';
import DatabaseService from '@app/services/database-service/database.service';
import { AuthentificationService } from './authentification.service';

const expect = chai.expect;
chai.use(spies);
chai.use(chaiAsPromised);

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
    });

    it('should be defined', () => {
        expect(authentificationService);
    });

    it('should login the admin', () => {
        const admin: User = { username: 'admin', password: 'admin', email: 'admin@admin.com' };
        expect(authentificationService.login(admin));
    });

    it('should createToken from userData', () => {
        const user: User = { username: 'admin', password: 'admin', email: 'admin@admin.com' };
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        expect(authentificationService.generateAccessToken(user)).to.exist;
    });

    it('signUp should call createUser method from databaseService', () => {
        const user: User = { username: 'admin', password: 'admin', email: 'admin@admin.com' };
        const spy = chai.spy.on(databaseServiceStub, 'createUser', () => { });
        authentificationService.signUp(user);
        expect(spy).to.have.been.called;
    });

    it('login should call getUser method from databaseService', () => {
        const user: User = { username: 'admin', password: 'admin', email: 'admin@admin.com' };
        const spy = chai.spy.on(databaseServiceStub, 'getUser', () => { });
        authentificationService.login(user);
        expect(spy).to.have.been.called;
    });
});
