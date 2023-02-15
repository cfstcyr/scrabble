import { TestBed } from '@angular/core/testing';
import { LOGIN_REQUIRED } from '@app/constants/services-errors';
import { PublicUser } from '@common/models/user';
import { UserService } from './user.service';

const USER: PublicUser = {
    avatar: 'avatar',
    email: 'email',
    username: 'username',
};

describe('UserService', () => {
    let service: UserService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(UserService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('isConnected', () => {
        it('should pass true if has user', (done) => {
            service.user.next(USER);

            service.isConnected().subscribe((isConnected) => {
                expect(isConnected).toBeTrue();
                done();
            });
        });

        it('should pass false if has no user', (done) => {
            service.isConnected().subscribe((isConnected) => {
                expect(isConnected).toBeFalse();
                done();
            });
        });
    });

    describe('getUser', () => {
        it('should return user', () => {
            service.user.next(USER);

            expect(service.getUser()).toEqual(USER);
        });

        it('should throw if not logged in', () => {
            expect(() => service.getUser()).toThrowError(LOGIN_REQUIRED);
        });
    });

    describe('isUser', () => {
        it('should return true if is user', () => {
            service.user.next(USER);

            expect(service.isUser(USER)).toBeTrue();
        });

        it('should return true if is username', () => {
            service.user.next(USER);

            expect(service.isUser(USER.username)).toBeTrue();
        });

        it('should be false if is not user', () => {
            service.user.next(USER);

            expect(service.isUser({ ...USER, username: 'not username' })).toBeFalse();
        });

        it('should return false if is not username', () => {
            service.user.next(USER);

            expect(service.isUser('not username')).toBeFalse();
        });

        it('should return false if no user', () => {
            expect(service.isUser(USER.username)).toBeFalse();
        });
    });
});
