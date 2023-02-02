import User from '@app/classes/user/user';
import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
import * as chai from 'chai';
import { Container } from 'typedi';
import { AuthentificationService } from './authentification.service';

const expect = chai.expect;

describe('AuthentificationService', () => {
    let testingUnit: ServicesTestingUnit;
    let authentificationService: AuthentificationService;

    beforeEach(async () => {
        testingUnit = new ServicesTestingUnit();
        await testingUnit.withMockDatabaseService();
    });

    beforeEach(() => {
        authentificationService = Container.get(AuthentificationService);
    });

    afterEach(() => {
        testingUnit.restore();
    });

    it('should be defined', () => {
        expect(authentificationService);
    });

    it('should login the admin', () => {
        const admin: User = { username: 'admin', password: 'admin', email: 'admin@admin.com' };
        expect(authentificationService.logout(admin));
    });

    it('should createToken from userData', () => {
        const user: User = { username: 'admin', password: 'admin', email: 'admin@admin.com' };
        expect(authentificationService.createToken(user));
    });
    it('signUp should call createUser method from databaseService', () => {
        const user: User = { username: 'admin', password: 'admin', email: 'admin@admin.com' };
        authentificationService.signUp(user);
    });
    it('login should call getUser method from databaseService', () => {
        const user: User = { username: 'admin', password: 'admin', email: 'admin@admin.com' };
        authentificationService.login(user);
    });
});
