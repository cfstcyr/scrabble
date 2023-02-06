/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppMaterialModule } from '@app/modules/material.module';
import { UserLoginCredentials } from '@common/models/user';

import { LoginContainerComponent } from './login-container.component';

const DEFAULT_LOGIN: UserLoginCredentials = {
    password: 'Faour#103',
    email: 'jdg@machine.epm',
};

describe('LoginContainerComponent', () => {
    let component: LoginContainerComponent;
    let fixture: ComponentFixture<LoginContainerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [LoginContainerComponent],
            imports: [
                AppMaterialModule,
                FormsModule,
                MatFormFieldModule,
                MatSelectModule,
                MatDividerModule,
                ReactiveFormsModule,
                MatProgressSpinnerModule,
                MatProgressBarModule,
                MatTableModule,
                MatDialogModule,
                MatSnackBarModule,
                BrowserAnimationsModule,
                MatCardModule,
            ],
            providers: [MatSnackBar],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LoginContainerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    const setValidFormValues = () => {
        component.loginForm.patchValue({ ...DEFAULT_LOGIN });
    };

    const setInvalidFormValues = () => {
        component.loginForm.patchValue({ email: '', password: '' });
    };

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('signupForm', () => {
        it('should be created', () => {
            expect(component.loginForm).toBeTruthy();
        });
    });

    describe('ngOnChanges', () => {
        it('should open snackbar if credentials are invalid', () => {
            const spy = spyOn<any>(component['snackBar'], 'open');
            component.areCredentialsInvalid = true;

            component.ngOnChanges();

            expect(spy).toHaveBeenCalled();
        });
    });

    describe('onSubmit', () => {
        describe('HAPPY PATH - Form is valid', () => {
            it('should emit user credentials', () => {
                const loginSpy = spyOn(component.login, 'next').and.callFake(() => {});

                setValidFormValues();
                component.onSubmit();
                expect(loginSpy).toHaveBeenCalledWith(DEFAULT_LOGIN);
            });
        });

        describe('SAD PATH - Form is invalid', () => {
            it('should NOT emit user credentials', () => {
                const loginSpy = spyOn(component.login, 'next').and.callFake(() => {});

                setInvalidFormValues();
                component.onSubmit();
                expect(loginSpy).not.toHaveBeenCalled();
            });
        });
    });

    describe('isFormValid', () => {
        it('should return true if form is valid and email is dirty', () => {
            setValidFormValues();
            component.loginForm.controls.email?.markAsDirty();
            component.loginForm.controls.password?.markAsPristine();

            expect(component.isFormValid()).toBeTrue();
        });

        it('should return true if form is valid and password is dirty', () => {
            setValidFormValues();
            component.loginForm.controls.email?.markAsPristine();
            component.loginForm.controls.password?.markAsDirty();

            expect(component.isFormValid()).toBeTrue();
        });

        it('should return false if form is invalid even if controls are dirty', () => {
            setInvalidFormValues();
            component.loginForm.controls.email?.markAsDirty();
            component.loginForm.controls.password?.markAsDirty();

            expect(component.isFormValid()).toBeFalse();
        });

        it('should return false if controls are pristine even if form is valid', () => {
            setValidFormValues();
            component.loginForm.controls.email?.markAsPristine();
            component.loginForm.controls.password?.markAsPristine();

            expect(component.isFormValid()).toBeFalse();
        });
    });

    describe('toggleOffInvalidCredentials', () => {
        it('should set areCredentialsInvalid to false', () => {
            component.areCredentialsInvalid = true;

            component.toggleOffInvalidCredentials();

            expect(component.areCredentialsInvalid).toBeFalse();
        });
    });
});
