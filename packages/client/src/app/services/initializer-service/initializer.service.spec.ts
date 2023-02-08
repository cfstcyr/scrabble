/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { InitializeState } from '@app/classes/connection-state-service/connection-state';
import SocketService from '@app/services/socket-service/socket.service';
import { Subject } from 'rxjs';
import { DatabaseService } from '@app/services/database-service/database.service';
import { InitializerService } from './initializer.service';
import { STATE_ERROR_DATABASE_NOT_CONNECTED_MESSAGE, STATE_ERROR_SERVER_NOT_CONNECTED_MESSAGE } from '@app/constants/services-errors';

describe('InitializerService', () => {
    let service: InitializerService;
    let socketService: jasmine.SpyObj<SocketService>;
    let databaseService: jasmine.SpyObj<DatabaseService>;

    beforeEach(() => {
        socketService = jasmine.createSpyObj('SocketService', ['connectSocket']);
        databaseService = jasmine.createSpyObj('DatabaseService', ['ping']);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                InitializerService,
                { provide: SocketService, useValue: socketService },
                { provide: DatabaseService, useValue: databaseService },
            ],
        });
        service = TestBed.inject(InitializerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('initialize', () => {
        it('should emit Ready on success', (done) => {
            const dbSubject = new Subject<void>();
            const socketSubject = new Subject<boolean>();

            socketService.connectSocket.and.returnValue(socketSubject);
            databaseService.ping.and.returnValue(dbSubject);

            service.state.subscribe((state) => {
                if (state.state === InitializeState.Ready) {
                    expect(true).toBeTrue();
                    done();
                }
            });

            service.initialize();

            setTimeout(() => {
                socketSubject.next(true);
                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            }, 10);

            setTimeout(() => {
                dbSubject.next();
                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            }, 10);
        });

        it('should emit Trying socket on socket error', (done) => {
            const dbSubject = new Subject<void>();
            const socketSubject = new Subject<boolean>();

            socketService.connectSocket.and.returnValue(socketSubject);
            databaseService.ping.and.returnValue(dbSubject);

            service.state.subscribe((state) => {
                if (state.state === InitializeState.Trying && state.message === STATE_ERROR_SERVER_NOT_CONNECTED_MESSAGE) {
                    expect(true).toBeTrue();
                    done();
                }
            });

            service.initialize();

            setTimeout(() => {
                socketSubject.next(false);
                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            }, 10);
        });

        it('should emit Trying DB on DB error', (done) => {
            const dbSubject = new Subject<void>();
            const socketSubject = new Subject<boolean>();

            socketService.connectSocket.and.returnValue(socketSubject);
            databaseService.ping.and.returnValue(dbSubject);

            service.state.subscribe((state) => {
                if (state.state === InitializeState.Trying && state.message === STATE_ERROR_DATABASE_NOT_CONNECTED_MESSAGE) {
                    expect(true).toBeTrue();
                    done();
                }
            });

            service.initialize();

            setTimeout(() => {
                socketSubject.next(true);
                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            }, 10);

            setTimeout(() => {
                dbSubject.error('error');
                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            }, 10);
        });
    });
});
