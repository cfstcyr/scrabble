import { Component } from '@angular/core';
import { UserCredentials } from '@common/models/user';

@Component({
    selector: 'app-signup-wrapper',
    templateUrl: './signup-wrapper.component.html',
    styleUrls: ['./signup-wrapper.component.scss'],
})
export class SignupWrapperComponent {
    isEmailTaken: boolean = false;
    isUsernameTaken: boolean = false;

    handleSignup(usercredentials: UserCredentials): void {
        // eslint-disable-next-line no-console
        console.log(usercredentials);
        // TODO: Add call to AuthentificationService
    }

    handleCheckEmailUnicity(email: string): void {
        // eslint-disable-next-line no-console
        console.log(email);
        // TODO: Add handle call to backend
    }

    handleCheckUsernameUnicity(username: string): void {
        // eslint-disable-next-line no-console
        console.log(username);
        // TODO: Add handle call to backend
    }
}
