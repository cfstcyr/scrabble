import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { matchValidator, PASSWORD_REGEX, USERNAME_MAX_LENGTH } from '@app/constants/authentification-constants';
import { NAME_VALIDATION } from '@app/constants/name-validation';

@Component({
    selector: 'app-signup-container',
    templateUrl: './signup-container.component.html',
    styleUrls: ['./signup-container.component.scss'],
})
export class SignupContainerComponent {
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
        return;
    }

    isFormValid(): boolean {
        return !this.hasBeenSubmitted || this.signupForm?.valid;
    }

    private fieldMatchValidator(): ValidatorFn {
        return (inputValue: AbstractControl): ValidationErrors | null => {
            const expectedValue = this.signupForm?.get('password')?.value;

            return inputValue && expectedValue && inputValue.value !== expectedValue ? { mismatch: true } : null;
        };
    }
}
