/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable dot-notation */
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ConnectionState } from '@app/classes/connection-state-service/connection-state';
import { SocketTestHelper } from '@app/classes/socket-test-helper/socket-test-helper.spec';
import { SOCKET_ID_UNDEFINED } from '@app/constants/services-errors';
import { SocketService } from '@app/services/';
import { AlertService } from '@app/services/alert-service/alert.service';

describe('SocketService', () => {
    let service: SocketService;
    let socket: SocketTestHelper;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatSnackBarModule],
            providers: [AlertService],
        });
        service = TestBed.inject(SocketService);

        socket = new SocketTestHelper();

        spyOn<any>(service, 'getSocket').and.returnValue(socket);
        service['socket'] = service['getSocket']();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('initializeService', () => {
        let nextStateSpy: jasmine.Spy;

        beforeEach(() => {
            nextStateSpy = spyOn<any>(service, 'nextState');
        });

        it('should call nextState with connected on connect', (done) => {
            service.initializeService();

            socket.on('connect', () => {
                expect(nextStateSpy).toHaveBeenCalledOnceWith(ConnectionState.Connected);
                done();
            });

            socket.peerSideEmit('connect');
        });

        it('should call nextState with Error on connect_error', (done) => {
            service.initializeService();

            socket.on('connect_error', () => {
                expect(nextStateSpy).toHaveBeenCalledOnceWith(ConnectionState.Error);
                done();
            });

            socket.peerSideEmit('connect_error');
        });
    });

    it('should call socket.on with an event', () => {
        const event = 'helloWorld';
        const action = () => {};
        const spy = spyOn(service['socket'], 'on');
        service.on(event, action);
        expect(spy).toHaveBeenCalledWith(event as any, action);
    });

    it('should throw when socket is undefined on getId', () => {
        (service['socket'] as unknown) = undefined;
        expect(() => service.getId()).toThrowError(SOCKET_ID_UNDEFINED);
    });
});
