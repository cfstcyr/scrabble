/* eslint-disable dot-notation */
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AlertType } from '@app/classes/alert/alert';

import { AlertService } from './alert.service';

describe('AlertService', () => {
    let service: AlertService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [BrowserAnimationsModule, MatSnackBarModule],
        });
        service = TestBed.inject(AlertService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('alert', () => {
        it('should call snackBar.openFromComponent', () => {
            spyOn(service['snackBar'], 'openFromComponent');
            service.alert(AlertType.Error, '');
            expect(service['snackBar'].openFromComponent).toHaveBeenCalled();
        });

        it('should call log', () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            spyOn(service as any, 'log');
            service.alert(AlertType.Error, '');
            expect(service['log']).toHaveBeenCalled();
        });
    });

    describe('error', () => {
        it('should call alert', () => {
            spyOn(service, 'alert');
            service.error('');
            expect(service.alert).toHaveBeenCalled();
        });
    });

    describe('warn', () => {
        it('should call alert', () => {
            spyOn(service, 'alert');
            service.warn('');
            expect(service.alert).toHaveBeenCalled();
        });
    });

    describe('success', () => {
        it('should call alert', () => {
            spyOn(service, 'alert');
            service.success('');
            expect(service.alert).toHaveBeenCalled();
        });
    });

    describe('info', () => {
        it('should call alert', () => {
            spyOn(service, 'alert');
            service.info('');
            expect(service.alert).toHaveBeenCalled();
        });
    });
});
