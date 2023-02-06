import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserLoginCredentials } from '@common/models/user';

@Component({
    selector: 'app-login-container',
    templateUrl: './login-container.component.html',
    styleUrls: ['./login-container.component.scss'],
})
export class LoginContainerComponent implements OnChanges {
    @Input() areCredentialsInvalid: boolean = false;
    @Output() login: EventEmitter<UserLoginCredentials> = new EventEmitter();

    loginForm: FormGroup;
    isPasswordShown: boolean = false;

    constructor() {
        this.loginForm = new FormGroup({
            email: new FormControl('', [Validators.required]),
            password: new FormControl('', [Validators.required]),
        });
    }

    ngOnChanges(): void {
        if (this.areCredentialsInvalid) {
            this.loginForm.controls.email?.markAsPristine();
            this.loginForm.controls.password?.markAsPristine();
        }
    }

    onSubmit(): void {
        if (this.loginForm.invalid) return;

        const userCredentials: UserLoginCredentials = {
            email: this.loginForm.get('email')?.value,
            password: this.loginForm.get('password')?.value,
        };

        this.login.next(userCredentials);
    }

    isFormValid(): boolean {
        return this.loginForm?.valid && (this.loginForm.controls.email?.dirty || this.loginForm.controls.password?.dirty);
    }

    handleCloseErrorBox(): void {
        this.areCredentialsInvalid = false;
    }
}
