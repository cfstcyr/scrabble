import { Component } from '@angular/core';
import { UserCredentials } from '@common/models/user';

@Component({
    selector: 'app-login-wrapper',
    templateUrl: './login-wrapper.component.html',
    styleUrls: ['./login-wrapper.component.scss'],
})
export class LogginWrapperComponent {
    areCredentialsInvalid: boolean = false;

    // eslint-disable-next-line no-unused-vars
    handleLogin(usercredentials: UserCredentials): void {
        // TODO: Add call to AuthentificationService
    }
}
