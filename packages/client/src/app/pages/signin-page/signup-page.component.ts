import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-signup-page',
    templateUrl: './signup-page.component.html',
    styleUrls: ['./signup-page.component.scss'],
})
export class SignUpPageComponent {
    signupForm: FormGroup;

    constructor() {
        this.signupForm = new FormGroup({
            username: new FormControl('', Validators.required),
            email: new FormControl('', [Validators.required, Validators.email]),
            password: new FormControl('', Validators.required),
            confirmPassword: new FormControl('', Validators.required),
        });
    }

    onSubmit(): void {
        return;
    }

    onUsernameChange(): void {
        return;
    }

    isFormValid(): boolean {
        return true;
    }

    onFormInvalidClick(): void {
        return;
    }
}
