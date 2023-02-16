import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ROUTE_HOME } from '@app/constants/routes-constants';
import { AlertService } from '@app/services/alert-service/alert.service';
import { AuthenticationService } from '@app/services/authentication-service/authentication.service';
import { UserLoginCredentials } from '@common/models/user';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { INVALID_CREDENTIALS, LOGIN_ERROR } from '@app/constants/authentification-constants';

@Component({
    selector: 'app-login-wrapper',
    templateUrl: './login-wrapper.component.html',
    styleUrls: ['./login-wrapper.component.scss'],
})
export class LoginWrapperComponent {
    constructor(
        private readonly authenticationService: AuthenticationService,
        private readonly alertService: AlertService,
        private readonly router: Router,
    ) {}

    handleLogin(userCredentials: UserLoginCredentials): void {
        this.authenticationService.login(userCredentials).subscribe(
            () => {
                this.router.navigate([ROUTE_HOME]);
            },
            (error: HttpErrorResponse) => {
                this.alertService.error(error.status === HttpStatusCode.NotAcceptable ? INVALID_CREDENTIALS : LOGIN_ERROR, { log: error.error });
            },
        );
    }
}
