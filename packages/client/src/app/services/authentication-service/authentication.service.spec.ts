import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthenticationController } from '@app/controllers/authentication-controller/authentication.controller';
import { authenticationSettings } from '@app/utils/settings';
import { PublicUser, UserLoginCredentials, UserSession, UserSignupInformation } from '@common/models/user';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserService } from '@app/services/user-service/user.service';
import { AuthenticationService, TokenValidation } from './authentication.service';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';

const DEFAULT_TOKEN = 'my-token';
const DEFAULT_CREDENTIALS: UserLoginCredentials = {
    email: 'email',
    password: 'password',
};
const DEFAULT_SIGNUP_INFO: UserSignupInformation = {
    avatar: 'avatar',
    email: 'a@a.a',
    password: 'password',
    username: 'username',
};
const DEFAULT_USER: PublicUser = {
    username: 'username',
    avatar: 'avatar',
    email: 'email@email.email',
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
            imports: [HttpClientTestingModule, MatSnackBarModule],
            providers: [{ provide: AuthenticationController, useValue: authenticationController }, UserService],
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

        // it('should set user', () => {
        //     const subject = new Subject<UserSession>();
        //     authenticationController.login.and.returnValue(subject);

        //     service.login(DEFAULT_CREDENTIALS).subscribe();

        //     subject.next(DEFAULT_USER_SESSION);

        //     expect(service.getUser()).toEqual(DEFAULT_USER);
        // });

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

            service.signup(DEFAULT_SIGNUP_INFO).subscribe();

            subject.next(DEFAULT_USER_SESSION);

            expect(authenticationSettings.getToken()).toEqual(DEFAULT_TOKEN);
        });

        // it('should set user', () => {
        //     const subject = new Subject<UserSession>();
        //     authenticationController.signup.and.returnValue(subject);

        //     service.signup(DEFAULT_CREDENTIALS).subscribe();

        //     subject.next(DEFAULT_USER_SESSION);

        //     expect(service.getUser()).toEqual(DEFAULT_USER);
        // });

        it('should throw if signup is invalid', (done) => {
            const subject = new Subject<UserSession>();
            authenticationController.signup.and.returnValue(
                subject.pipe(
                    map(() => {
                        throw new Error();
                    }),
                ),
            );

            service.signup(DEFAULT_SIGNUP_INFO).subscribe(
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

            service.signup(DEFAULT_SIGNUP_INFO).subscribe();

            subject.next(DEFAULT_USER_SESSION);
        });

        it('should remove token', () => {
            service.signOut();
            expect(authenticationSettings.getToken()).toBeUndefined();
        });

        // it('should remove user', () => {
        //     service.signOut();
        //     expect(() => service.getUser()).toThrow();
        // });
    });

    describe('validateToken', () => {
        it('should return Ok if token is valid', (done) => {
            authenticationSettings.setToken(DEFAULT_TOKEN);
            const subject = new Subject<UserSession>();
            authenticationController.validateToken.and.returnValue(subject);

            service.validateToken().subscribe((val) => {
                expect(val).toEqual(TokenValidation.Ok);
                done();
            });

            subject.next(DEFAULT_USER_SESSION);
        });

        it('should return NoToken if no token', (done) => {
            const subject = new Subject<UserSession>();
            authenticationController.validateToken.and.returnValue(subject);

            service.validateToken().subscribe((val) => {
                expect(val).toEqual(TokenValidation.NoToken);
                done();
            });

            subject.next(DEFAULT_USER_SESSION);
        });

        it('should return AlreadyConnected if error is Unauthorized', (done) => {
            authenticationSettings.setToken(DEFAULT_TOKEN);
            const subject = new Subject<UserSession>();
            authenticationController.validateToken.and.returnValue(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                subject.pipe(
                    map(() => {
                        // eslint-disable-next-line @typescript-eslint/no-throw-literal
                        throw new HttpErrorResponse({ status: HttpStatusCode.Unauthorized });
                    }),
                ),
            );

            service.validateToken().subscribe((val) => {
                expect(val).toEqual(TokenValidation.AlreadyConnected);
                done();
            });

            subject.next(DEFAULT_USER_SESSION);
        });

        it('should return UnknownError if token is invalid', (done) => {
            authenticationSettings.setToken(DEFAULT_TOKEN);
            const subject = new Subject<UserSession>();
            authenticationController.validateToken.and.returnValue(
                subject.pipe(
                    map(() => {
                        throw new Error();
                    }),
                ),
            );

            service.validateToken().subscribe((val) => {
                expect(val).toEqual(TokenValidation.UnknownError);
                done();
            });

            subject.next(DEFAULT_USER_SESSION);
        });
    });
});
