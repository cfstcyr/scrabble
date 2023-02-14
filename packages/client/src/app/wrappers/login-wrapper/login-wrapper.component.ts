import { Component } from '@angular/core';
import { UserLoginCredentials } from '@common/models/user';

@Component({
    selector: 'app-login-wrapper',
    templateUrl: './login-wrapper.component.html',
    styleUrls: ['./login-wrapper.component.scss'],
})
export class LogginWrapperComponent {
    errorMessage?: string = undefined;

    // eslint-disable-next-line no-unused-vars
    handleLogin(usercredentials: UserLoginCredentials): void {
        // TODO: Add call to AuthentificationService
    }
}
