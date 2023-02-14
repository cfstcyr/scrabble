import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CANNOT_VERIFY_EMAIL_UNICITY, CANNOT_VERIFY_USERNAME_UNICITY } from '@app/constants/authentification-constants';
import { AlertService } from '@app/services/alert-service/alert.service';
import { AuthenticationService } from '@app/services/authentication-service/authentication.service';
import { UserSignupInformation } from '@common/models/user';

@Component({
    selector: 'app-signup-wrapper',
    templateUrl: './signup-wrapper.component.html',
    styleUrls: ['./signup-wrapper.component.scss'],
})
export class SignupWrapperComponent {
    isEmailTaken: boolean = false;
    isUsernameTaken: boolean = false;

    constructor(
        private readonly authenticationService: AuthenticationService,
        private readonly alertService: AlertService,
        private readonly router: Router,
    ) {}

    handleSignup(userCredentials: UserSignupInformation): void {
        this.authenticationService.signup(userCredentials).subscribe(
            () => {
                this.router.navigate(['/home']);
            },
            (message) => {
                this.alertService.error(message);
            },
        );
    }

    handleCheckEmailUnicity(email: string): void {
        this.authenticationService.validateEmail(email).subscribe(
            (isAvailable) => (this.isEmailTaken = !isAvailable),
            (error) => {
                this.alertService.error(CANNOT_VERIFY_EMAIL_UNICITY, { log: error });
            },
        );
    }

    handleCheckUsernameUnicity(username: string): void {
        this.authenticationService.validateUsername(username).subscribe(
            (isAvailable) => (this.isUsernameTaken = !isAvailable),
            (error) => {
                this.alertService.error(CANNOT_VERIFY_USERNAME_UNICITY, { log: error });
            },
        );
    }
}
