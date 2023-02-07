import { Component } from '@angular/core';
import { UserSignupInformation } from '@common/models/user';

@Component({
    selector: 'app-signup-wrapper',
    templateUrl: './signup-wrapper.component.html',
    styleUrls: ['./signup-wrapper.component.scss'],
})
export class SignupWrapperComponent {
    isEmailTaken: boolean = false;
    isUsernameTaken: boolean = false;

    // eslint-disable-next-line no-unused-vars
    handleSignup(usercredentials: UserSignupInformation): void {
        // TODO: Add call to AuthentificationService
    }

    // eslint-disable-next-line no-unused-vars
    handleCheckEmailUnicity(email: string): void {
        // TODO: Add handle call to backend
    }

    // eslint-disable-next-line no-unused-vars
    handleCheckUsernameUnicity(username: string): void {
        // TODO: Add handle call to backend
    }
}
