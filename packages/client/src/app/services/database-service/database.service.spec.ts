/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpStatusCode } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ConnectionState } from '@app/classes/connection-state-service/connection-state';
import { DB_CONNECTED_ENDPOINT } from '@app/constants/services-errors';

import { DatabaseService } from './database.service';

describe('DatabaseService', () => {
    let service: DatabaseService;
    let http: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(DatabaseService);
        http = TestBed.inject(HttpTestingController);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('checkDatabase', () => {
        it('should call nextState with connected on success', () => {
            const spy = spyOn<any>(service, 'nextState');

            service.checkDatabase();

            http.expectOne(DB_CONNECTED_ENDPOINT).flush({ status: HttpStatusCode.NoContent });
            expect(spy).toHaveBeenCalledOnceWith(ConnectionState.Connected);
        });

        it('should call nextState with error on error', () => {
            const spy = spyOn<any>(service, 'nextState');

            service.checkDatabase();

            http.expectOne(DB_CONNECTED_ENDPOINT).error(new ErrorEvent(''));
            expect(spy).toHaveBeenCalledOnceWith(ConnectionState.Error);
        });
    });
});
