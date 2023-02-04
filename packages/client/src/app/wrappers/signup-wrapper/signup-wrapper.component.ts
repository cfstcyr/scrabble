import { Component } from '@angular/core';
import { UserCredentials } from '@common/models/user';

@Component({
    selector: 'app-signup-wrapper',
    templateUrl: './signup-wrapper.component.html',
    styleUrls: ['./signup-wrapper.component.scss'],
})
export class SignupWrapperComponent {
    // eslint-disable-next-line no-unused-vars
    signup(usercredentials: UserCredentials): void {
        // TODO: Add call to AuthentificationService
    }
}
