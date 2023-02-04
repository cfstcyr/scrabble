import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { matchValidator, PASSWORD_REGEX, USERNAME_MAX_LENGTH } from '@app/constants/authentification-constants';
import { NAME_VALIDATION } from '@app/constants/name-validation';
import { UserCredentials } from '@common/models/user';

@Component({
    selector: 'app-signup-container',
    templateUrl: './signup-container.component.html',
    styleUrls: ['./signup-container.component.scss'],
})
export class SignupContainerComponent {
    @Input() isEmailTaken: boolean = false;
    @Input() isUsernameTaken: boolean = false;
    @Output() checkEmailUnicity: EventEmitter<string> = new EventEmitter();
    @Output() checkUsernameUnicity: EventEmitter<string> = new EventEmitter();
    @Output() signup: EventEmitter<UserCredentials> = new EventEmitter();

    signupForm: FormGroup;
    arePasswordsShown: boolean = false;

    private hasBeenSubmitted: boolean = false;

    constructor() {
        this.signupForm = new FormGroup(
            {
                username: new FormControl('', [
                    Validators.required,
                    Validators.minLength(1),
                    Validators.maxLength(USERNAME_MAX_LENGTH),
                    Validators.pattern(NAME_VALIDATION.rule),
                ]),
                email: new FormControl('', [Validators.required, Validators.email]),
                password: new FormControl('', [Validators.required, Validators.pattern(PASSWORD_REGEX)]),
                confirmPassword: new FormControl('', [Validators.required, this.fieldMatchValidator()]),
            },
            [matchValidator('password', 'confirmPassword')],
        );
    }

    onSubmit(): void {
        this.hasBeenSubmitted = true;
        const userCredentials: UserCredentials = {
            email: this.signupForm.get('email')?.value,
            username: this.signupForm.get('username')?.value,
            password: this.signupForm.get('password')?.value,
        };

        this.signup.next(userCredentials);
    }

    isFormValid(): boolean {
        return !this.hasBeenSubmitted || this.signupForm?.valid;
    }

    handleEmailLoseFocus(): void {
        this.checkEmailUnicity.next(this.signupForm.get('email')?.value);
    }

    handleUsernameLoseFocus(): void {
        this.checkUsernameUnicity.next(this.signupForm.get('username')?.value);
    }

    private fieldMatchValidator(): ValidatorFn {
        return (inputValue: AbstractControl): ValidationErrors | null => {
            const expectedValue = this.signupForm?.get('password')?.value;

            return inputValue && expectedValue && inputValue.value !== expectedValue ? { mismatch: true } : null;
        };
    }
}
