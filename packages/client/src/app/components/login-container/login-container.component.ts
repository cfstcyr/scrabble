import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserCredentials } from '@common/models/user';

@Component({
    selector: 'app-login-container',
    templateUrl: './login-container.component.html',
    styleUrls: ['./login-container.component.scss'],
})
export class LoginContainerComponent {
    @Input() invalidCredentials: boolean = false;
    @Output() login: EventEmitter<UserCredentials> = new EventEmitter();

    loginForm: FormGroup;
    isPasswordShown: boolean = false;

    constructor() {
        this.loginForm = new FormGroup({
            email: new FormControl('', [Validators.required]),
            password: new FormControl('', [Validators.required]),
        });
    }

    onSubmit(): void {
        if (this.loginForm.invalid) return;

        const userCredentials: UserCredentials = {
            email: this.loginForm.get('email')?.value,
            username: this.loginForm.get('username')?.value,
            password: this.loginForm.get('password')?.value,
        };

        this.login.next(userCredentials);
    }

    isFormValid(): boolean {
        return this.loginForm?.valid;
    }
}
