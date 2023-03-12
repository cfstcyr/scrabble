/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { USER_NOT_FOUND } from '@app/constants/services-errors';
import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
import { EditableUserFields, PublicUser, User } from '@common/models/user';
import { expect } from 'chai';
import { Knex } from 'knex';
import { Container } from 'typedi';
import { UserService } from './user-service';

const DEFAULT_USER: User = {
    idUser: 1,
    avatar: 'the-way-of-the-water',
    email: 'me@me.com',
    password: '123',
    username: 'username',
};
const DEFAULT_PUBLIC_USER: PublicUser = {
    avatar: DEFAULT_USER.avatar,
    email: DEFAULT_USER.email,
    username: DEFAULT_USER.username,
};

describe('UserService', () => {
    let service: UserService;
    let testingUnit: ServicesTestingUnit;
    let userTable: () => Knex.QueryBuilder<User>;

    beforeEach(async () => {
        testingUnit = new ServicesTestingUnit();
        await testingUnit.withMockDatabaseService();
    });

    beforeEach(() => {
        service = Container.get(UserService);
        userTable = () => service['table'];
    });

    afterEach(() => {
        testingUnit.restore();
    });

    it('should create', () => {
        expect(service).to.exist;
    });

    describe('search', () => {
        beforeEach(async () => {
            await userTable().insert({ ...DEFAULT_USER, idUser: 1, username: 'user1', email: 'user1@me.com' });
            await userTable().insert({ ...DEFAULT_USER, idUser: 2, username: 'user2', email: 'user2@me.com' });
            await userTable().insert({ ...DEFAULT_USER, idUser: 3, username: 'user3', email: 'user3@me.com' });
            await userTable().insert({ ...DEFAULT_USER, idUser: 4, username: 'user4', email: 'user4@me.com' });
            await userTable().insert({ ...DEFAULT_USER, idUser: 5, username: 'user5', email: 'user5@me.com' });
            await userTable().insert({ ...DEFAULT_USER, idUser: 6, username: 'different', email: 'different@me.com' });
        });

        it('should return all matching users 1', async () => {
            expect(service.search('user')).to.eventually.have.length(5);
        });

        it('should return all matching users 2', async () => {
            expect(service.search('different')).to.eventually.have.length(1);
        });

        it('should exclude user', async () => {
            expect(service.search('user', 2)).to.eventually.have.length(4);
        });

        it('should return nothing if no matching', () => {
            expect(service.search('notmatching')).to.eventually.have.length(0);
        });
    });

    describe('getUserById', () => {
        it(' should return a user', async () => {
            await userTable().insert(DEFAULT_USER);
            expect(service.getUserById(DEFAULT_USER.idUser)).to.eventually.equal(DEFAULT_USER);
        });

        it('should throw if not found', async () => {
            expect(service.getUserById(DEFAULT_USER.idUser)).to.eventually.rejectedWith(USER_NOT_FOUND);
        });
    });

    describe('getPublicUserById', () => {
        it(' should return a user', async () => {
            await userTable().insert(DEFAULT_USER);
            expect(service.getPublicUserById(DEFAULT_USER.idUser)).to.eventually.equal(DEFAULT_PUBLIC_USER);
        });
    });

    describe('getUserByEmail', () => {
        it(' should return a user', async () => {
            await userTable().insert(DEFAULT_USER);
            expect(service.getUserByEmail(DEFAULT_USER.email)).to.eventually.equal(DEFAULT_USER);
        });

        it('should throw if not found', async () => {
            expect(service.getUserByEmail(DEFAULT_USER.email)).to.eventually.rejectedWith(USER_NOT_FOUND);
        });
    });

    describe('editUser', () => {
        it('should change avatar', async () => {
            await userTable().insert(DEFAULT_USER);
            const avatar = 'new-cool-avatar';
            await service.editUser(DEFAULT_USER.idUser, { avatar });
            expect((await service.getUserById(DEFAULT_USER.idUser)).avatar).to.equal(avatar);
        });

        it('should change username', async () => {
            await userTable().insert(DEFAULT_USER);
            const username = 'new-cool-username';
            await service.editUser(DEFAULT_USER.idUser, { username });
            expect((await service.getUserById(DEFAULT_USER.idUser)).username).to.equal(username);
        });

        it('should not change other fields', async () => {
            await userTable().insert(DEFAULT_USER);
            const email = 'new@email.com';
            await service.editUser(DEFAULT_USER.idUser, { email } as EditableUserFields);
            expect((await service.getUserById(DEFAULT_USER.idUser)).email).to.equal(DEFAULT_USER.email);
        });
    });
});
