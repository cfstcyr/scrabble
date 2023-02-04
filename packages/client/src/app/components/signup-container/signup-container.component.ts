import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-signup-container',
    templateUrl: './signup-container.component.html',
    styleUrls: ['./signup-container.component.scss'],
})
export class SignupContainerComponent {
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
}
