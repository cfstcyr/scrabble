/* eslint-disable dot-notation */
import { Application } from '@app/app';
import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
import { UserService } from '@app/services/user-service/user-service';
import { PublicUser, User } from '@common/models/user';
import { StatusCodes } from 'http-status-codes';
import { Container } from 'typedi';
import * as supertest from 'supertest';
import { PublicUserStatistics, UserStatistics } from '@common/models/user-statistics';
import { UserStatisticsService } from '@app/services/user-statistics-service/user-statistics-service';

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
const DEFAULT_PUBLIC_STATISTICS: PublicUserStatistics = {
    averagePointsPerGame: 50,
    averageTimePerGame: 300,
    gamesPlayedCount: 4,
    gamesWonCount: 2,
};
const DEFAULT_STATISTICS: UserStatistics = {
    idUser: DEFAULT_USER.idUser,
    ...DEFAULT_PUBLIC_STATISTICS,
};

describe('UserController', () => {
    let expressApp: Express.Application;
    let testingUnit: ServicesTestingUnit;
    let userService: UserService;
    let userStatisticsService: UserStatisticsService;
    // let authenticationService: AuthentificationService;

    beforeEach(async () => {
        testingUnit = new ServicesTestingUnit().withStubbedDictionaryService().withMockedAuthentification();
        await testingUnit.withMockDatabaseService();
    });

    beforeEach(() => {
        expressApp = Container.get(Application).app;
        userService = Container.get(UserService);
        userStatisticsService = Container.get(UserStatisticsService);
    });

    afterEach(() => {
        testingUnit.restore();
    });

    describe('/api/users', () => {
        describe('GET', () => {
            it('should return user', async () => {
                await userService['table'].insert(DEFAULT_USER);
                return supertest(expressApp).get('/api/users').send({ idUser: DEFAULT_USER.idUser }).expect(StatusCodes.OK, DEFAULT_PUBLIC_USER);
            });

            it('should return 404 if not found', async () => {
                return supertest(expressApp).get('/api/users').send({ idUser: DEFAULT_USER.idUser }).expect(StatusCodes.NOT_FOUND);
            });
        });

        describe('PATCH', () => {
            it('should edit user', async () => {
                const avatar = 'new-avatar';
                await userService['table'].insert(DEFAULT_USER);

                return supertest(expressApp)
                    .patch('/api/users')
                    .send({ idUser: DEFAULT_USER.idUser, avatar })
                    .expect(StatusCodes.OK, { ...DEFAULT_PUBLIC_USER, avatar });
            });
        });
    });

    describe('/api/users/statistics', () => {
        describe('GET', () => {
            it('should return user statistics', async () => {
                await userService['table'].insert(DEFAULT_USER);
                await userStatisticsService['table'].insert(DEFAULT_STATISTICS);

                return supertest(expressApp)
                    .get('/api/users/statistics')
                    .send({ idUser: DEFAULT_USER.idUser })
                    .expect(StatusCodes.OK, DEFAULT_PUBLIC_STATISTICS);
            });
        });
    });

    describe('/api/users/search', () => {
        describe('GET', () => {
            it('should return search', async () => {
                return supertest(expressApp).get('/api/users/search?q=').send({ idUser: -1 }).expect(StatusCodes.OK);
            });
        });
    });
});
