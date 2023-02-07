import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthenticationController } from '@app/controllers/authentication-controller/authentication.controller';
import { authenticationSettings } from '@app/utils/settings';
import { Credentials, PublicUser, UserSession } from '@common/models/user';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { AuthenticationService } from './authentication.service';

const DEFAULT_TOKEN = 'my-token';
const DEFAULT_CREDENTIALS: Credentials = {
    email: 'email',
    password: 'password',
};
const DEFAULT_USER: PublicUser = {
    username: 'username',
    avatar: 'avatar',
};
const DEFAULT_USER_SESSION: UserSession = {
    token: DEFAULT_TOKEN,
    user: DEFAULT_USER,
};

describe('AuthenticationService', () => {
    let service: AuthenticationService;
    let authenticationController: jasmine.SpyObj<AuthenticationController>;

    beforeEach(() => {
        authenticationController = jasmine.createSpyObj('AuthenticationController', ['login', 'signup', 'validateToken']);
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [{ provide: AuthenticationController, useValue: authenticationController }],
        });
        service = TestBed.inject(AuthenticationService);
    });

    afterEach(() => {
        authenticationSettings.reset();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('login', () => {
        it('should set token if valid', () => {
            const subject = new Subject<UserSession>();
            authenticationController.login.and.returnValue(subject);

            service.login(DEFAULT_CREDENTIALS).subscribe();

            subject.next(DEFAULT_USER_SESSION);

            expect(authenticationSettings.getToken()).toEqual(DEFAULT_TOKEN);
        });

        it('should set user', () => {
            const subject = new Subject<UserSession>();
            authenticationController.login.and.returnValue(subject);

            service.login(DEFAULT_CREDENTIALS).subscribe();

            subject.next(DEFAULT_USER_SESSION);

            expect(service.getUser()).toEqual(DEFAULT_USER);
        });

        it('should throw if login is invalid', (done) => {
            const subject = new Subject<UserSession>();
            authenticationController.login.and.returnValue(
                subject.pipe(
                    map(() => {
                        throw new Error();
                    }),
                ),
            );

            service.login(DEFAULT_CREDENTIALS).subscribe(
                () => {
                    expect(false).toBeTrue();
                    done();
                },
                () => {
                    expect(true).toBeTrue();
                    done();
                },
            );

            subject.next(DEFAULT_USER_SESSION);
        });
    });

    describe('signup', () => {
        it('should set token if valid', () => {
            const subject = new Subject<UserSession>();
            authenticationController.signup.and.returnValue(subject);

            service.signup(DEFAULT_CREDENTIALS).subscribe();

            subject.next(DEFAULT_USER_SESSION);

            expect(authenticationSettings.getToken()).toEqual(DEFAULT_TOKEN);
        });

        it('should set user', () => {
            const subject = new Subject<UserSession>();
            authenticationController.signup.and.returnValue(subject);

            service.signup(DEFAULT_CREDENTIALS).subscribe();

            subject.next(DEFAULT_USER_SESSION);

            expect(service.getUser()).toEqual(DEFAULT_USER);
        });

        it('should throw if signup is invalid', (done) => {
            const subject = new Subject<UserSession>();
            authenticationController.signup.and.returnValue(
                subject.pipe(
                    map(() => {
                        throw new Error();
                    }),
                ),
            );

            service.signup(DEFAULT_CREDENTIALS).subscribe(
                () => {
                    expect(false).toBeTrue();
                    done();
                },
                () => {
                    expect(true).toBeTrue();
                    done();
                },
            );

            subject.next(DEFAULT_USER_SESSION);
        });
    });

    describe('signOut', () => {
        beforeEach(() => {
            // Login
            const subject = new Subject<UserSession>();
            authenticationController.signup.and.returnValue(subject);

            service.signup(DEFAULT_CREDENTIALS).subscribe();

            subject.next(DEFAULT_USER_SESSION);
        });

        it('should remove token', () => {
            service.signOut();
            expect(authenticationSettings.getToken()).toBeUndefined();
        });

        it('should remove user', () => {
            service.signOut();
            expect(() => service.getUser()).toThrow();
        });
    });

    describe('validateToken', () => {
        it('should return true if token is valid', (done) => {
            authenticationSettings.setToken(DEFAULT_TOKEN);
            const subject = new Subject<UserSession>();
            authenticationController.validateToken.and.returnValue(subject);

            service.validateToken().subscribe((val) => {
                expect(val).toBeTrue();
                done();
            });

            subject.next(DEFAULT_USER_SESSION);
        });

        it('should return false if no token', (done) => {
            const subject = new Subject<UserSession>();
            authenticationController.validateToken.and.returnValue(subject);

            service.validateToken().subscribe((val) => {
                expect(val).toBeFalse();
                done();
            });

            subject.next(DEFAULT_USER_SESSION);
        });

        it('should return false if token is invalid', (done) => {
            const subject = new Subject<UserSession>();
            authenticationController.validateToken.and.returnValue(
                subject.pipe(
                    map(() => {
                        throw new Error();
                    }),
                ),
            );

            service.validateToken().subscribe((val) => {
                expect(val).toBeFalse();
                done();
            });

            subject.next(DEFAULT_USER_SESSION);
        });
    });
});
