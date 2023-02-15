import { Location } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { LoginContainerComponent } from '@app/components/login-container/login-container.component';
import { AlertService } from '@app/services/alert-service/alert.service';
import { AuthenticationService } from '@app/services/authentication-service/authentication.service';
import { UserLoginCredentials, UserSession } from '@common/models/user';
import { Subject } from 'rxjs';
import { LoginWrapperComponent } from './login-wrapper.component';

const USER_CREDENTIALS: UserLoginCredentials = {
    email: 'email',
    password: 'password',
};

@Component({
    template: '<p>Bonjour</p>',
})
export class DefaultComponent {}

describe('LoginWrapperComponent', () => {
    let component: LoginWrapperComponent;
    let fixture: ComponentFixture<LoginWrapperComponent>;
    let authenticationService: jasmine.SpyObj<AuthenticationService>;

    beforeEach(async () => {
        authenticationService = jasmine.createSpyObj(AuthenticationService, ['login']);

        await TestBed.configureTestingModule({
            declarations: [LoginWrapperComponent, LoginContainerComponent],
            imports: [
                HttpClientTestingModule,
                RouterTestingModule.withRoutes([{ path: 'home', component: DefaultComponent }]),
                MatSnackBarModule,
                BrowserAnimationsModule,
            ],
            providers: [{ provide: AuthenticationService, useValue: authenticationService }, AlertService],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LoginWrapperComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('handleLogin', () => {
        it('should navigate to home on login', fakeAsync(() => {
            const location = TestBed.inject(Location);
            const loginSubject = new Subject<UserSession>();
            authenticationService.login.and.returnValue(loginSubject);

            component.handleLogin(USER_CREDENTIALS);

            loginSubject.next();

            tick();

            expect(location.path()).toEqual('/home');
        }));

        it('should call error on error', () => {
            const loginSubject = new Subject<UserSession>();
            authenticationService.login.and.returnValue(loginSubject);

            const alertService = TestBed.inject(AlertService);
            const spy = spyOn(alertService, 'error');

            component.handleLogin(USER_CREDENTIALS);

            loginSubject.error(new Error());

            expect(spy).toHaveBeenCalled();
        });
    });
});
