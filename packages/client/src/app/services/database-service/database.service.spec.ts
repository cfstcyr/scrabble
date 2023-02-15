/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
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

    describe('ping', () => {
        it('should resolve if ok', (done) => {
            service.ping().subscribe(
                () => {
                    expect(true).toBeTrue();
                    done();
                },
                () => {
                    expect(false).toBeTrue();
                    done();
                },
            );

            const req = http.expectOne(DB_CONNECTED_ENDPOINT);
            req.flush({});
        });

        it('should resolve if ok', (done) => {
            service.ping().subscribe(
                () => {
                    expect(false).toBeTrue();
                    done();
                },
                () => {
                    expect(true).toBeTrue();
                    done();
                },
            );

            const req = http.expectOne(DB_CONNECTED_ENDPOINT);
            req.error(new ErrorEvent(''));
        });
    });
});
