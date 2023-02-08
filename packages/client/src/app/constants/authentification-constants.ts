import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const USERNAME_MAX_LENGTH = 40;
export const PASSWORD_REGEX = new RegExp('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[!@#\\$&*~]).{8,}$');

export const matchValidator = (source: string, target: string): ValidatorFn => {
    return (control: AbstractControl): ValidationErrors | null => {
        const sourceCtrl = control.get(source);
        const targetCtrl = control.get(target);

        return sourceCtrl && targetCtrl && sourceCtrl.value !== targetCtrl.value ? { mismatch: true } : null;
    };
};

export const INVALID_CREDENTIALS = 'Identifiants invalides';
