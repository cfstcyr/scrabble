/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ConnectionState, InitializeState } from '@app/classes/connection-state-service/connection-state';
import { SocketTestHelper } from '@app/classes/socket-test-helper/socket-test-helper.spec';
import SocketService from '@app/services/socket-service/socket.service';
import { Socket } from 'socket.io-client';
import { InitializerService } from './initializer.service';

describe('InitializerService', () => {
    let service: InitializerService;
    let socketServiceMock: SocketService;
    let socketHelper: SocketTestHelper;

    beforeEach(() => {
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketService();
        socketServiceMock['socket'] = socketHelper as unknown as Socket;
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [InitializerService, { provide: SocketService, useValue: socketServiceMock }],
        });
        service = TestBed.inject(InitializerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('constructor', () => {
        it('should call handleSocketUpdate on socket update', () => {
            const spy = spyOn<any>(service, 'handleSocketUpdate');
            service['socketService']['nextState'](ConnectionState.Loading);
            expect(spy).toHaveBeenCalled();
        });

        it('should call handleDatabaseUpdate on db update', () => {
            const spy = spyOn<any>(service, 'handleDatabaseUpdate');
            service['databaseService']['nextState'](ConnectionState.Loading);
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('ngOnDestroy', () => {
        it('should call next and complete', () => {
            const nextSpy = spyOn(service['destroyed$'], 'next');
            const completeSpy = spyOn(service['destroyed$'], 'complete');

            service.ngOnDestroy();

            expect(nextSpy).toHaveBeenCalledOnceWith(true);
            expect(completeSpy).toHaveBeenCalled();
        });
    });

    describe('initialize', () => {
        it('should call socketService.initializeService', () => {
            const spy = spyOn(service['socketService'], 'initializeService');
            service.initialize();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('isStateError', () => {
        it('should return true if is error', () => {
            const errors = [InitializeState.DatabaseNotReachable, InitializeState.ServerNotReachable];

            for (const error of errors) {
                service['state$'].next(error);
                expect(service['isStateError']()).toBeTrue();
            }
        });

        it('should return false if is not error', () => {
            const states = [InitializeState.Ready, InitializeState.Loading];

            for (const state of states) {
                service['state$'].next(state);
                expect(service['isStateError']()).toBeFalse();
            }
        });
    });

    describe('handleSocketUpdate', () => {
        let checkDatabaseSpy: jasmine.Spy;

        beforeEach(() => {
            checkDatabaseSpy = spyOn(service['databaseService'], 'checkDatabase');
        });

        it('should set state to loading and check database if connected', () => {
            service['state$'].next(InitializeState.ServerNotReachable);

            service['handleSocketUpdate'](ConnectionState.Connected);

            expect(checkDatabaseSpy).toHaveBeenCalled();
            expect(service['state$'].value).toEqual(InitializeState.Loading);
        });

        it('should not set state to loading and check database if connected if state is ready', () => {
            service['state$'].next(InitializeState.Ready);

            service['handleSocketUpdate'](ConnectionState.Connected);

            expect(checkDatabaseSpy).not.toHaveBeenCalled();
            expect(service['state$'].value).toEqual(InitializeState.Ready);
        });

        it('should set state to ServerNotReachable if error', () => {
            service['state$'].next(InitializeState.Ready);

            service['handleSocketUpdate'](ConnectionState.Error);

            expect(checkDatabaseSpy).not.toHaveBeenCalled();
            expect(service['state$'].value).toEqual(InitializeState.ServerNotReachable);
        });
    });

    describe('handleDatabaseUpdate', () => {
        let canSwitchToReadyFromDatabaseUpdateSpy: jasmine.Spy;
        let isStateError: jasmine.Spy;

        beforeEach(() => {
            canSwitchToReadyFromDatabaseUpdateSpy = spyOn<any>(service, 'canSwitchToReadyFromDatabaseUpdate').and.returnValue(true);
            isStateError = spyOn<any>(service, 'isStateError').and.returnValue(false);
        });

        it('should set state to ready if connected and canSwitchToReadyFromDatabaseUpdate', () => {
            service['state$'].next(InitializeState.Loading);

            service['handleDatabaseUpdate'](ConnectionState.Connected);

            expect(service['state$'].value).toEqual(InitializeState.Ready);
        });

        it('should not set state to ready if connected and not canSwitchToReadyFromDatabaseUpdate', () => {
            service['state$'].next(InitializeState.Loading);
            canSwitchToReadyFromDatabaseUpdateSpy.and.returnValue(false);

            service['handleDatabaseUpdate'](ConnectionState.Connected);

            expect(service['state$'].value).toEqual(InitializeState.Loading);
        });

        it('should set state to DatabaseNotReachable if error', () => {
            service['state$'].next(InitializeState.Loading);

            service['handleDatabaseUpdate'](ConnectionState.Error);

            expect(service['state$'].value).toEqual(InitializeState.DatabaseNotReachable);
        });

        it('should not set state to DatabaseNotReachable if error is already an error', () => {
            service['state$'].next(InitializeState.Loading);
            isStateError.and.returnValue(true);

            service['handleDatabaseUpdate'](ConnectionState.Error);

            expect(service['state$'].value).toEqual(InitializeState.Loading);
        });
    });

    describe('canSwitchToReadyFromDatabaseUpdate', () => {
        const tests: [state: InitializeState, expected: boolean][] = [
            [InitializeState.DatabaseNotReachable, true],
            [InitializeState.Loading, true],
            [InitializeState.Ready, false],
            [InitializeState.ServerNotReachable, false],
        ];

        for (const [state, expected] of tests) {
            it(`should return ${expected} if ${state}`, () => {
                service['state$'].next(state);
                expect(service['canSwitchToReadyFromDatabaseUpdate']()).toEqual(expected);
            });
        }
    });
});
