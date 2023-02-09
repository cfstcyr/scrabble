import { Injectable } from '@angular/core';
import { ConnectionState } from '@app/classes/connection-state-service/connection-state';
import ConnectionStateService from '@app/classes/connection-state-service/connection-state-service';
import { SOCKET_ID_UNDEFINED } from '@app/constants/services-errors';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { ClientSocket } from '@app/classes/communication/socket-type';
import { AlertService } from '@app/services/alert-service/alert.service';
import { SocketErrorResponse } from '@common/models/error';
@Injectable({
    providedIn: 'root',
})
export default class SocketService extends ConnectionStateService {
    socket: ClientSocket;

    constructor(private alertService: AlertService) {
        super();
    }

    initializeService(): void {
        this.socket = this.getSocket();
        this.socket.on('connect', () => this.nextState(ConnectionState.Connected)).on('connect_error', () => this.nextState(ConnectionState.Error));

        this.socket.on('error', (error: SocketErrorResponse) => {
            this.alertService.error(error.message, { log: `Error ${error.status} ${error.error}: ${error.message}` });
        });
    }

    getId(): string {
        if (!this.socket) throw new Error(SOCKET_ID_UNDEFINED);

        return this.socket.id;
    }

    on<T>(ev: string, handler: (arg: T) => void): void {
        if (!this.socket) {
            return;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.socket.on(ev as any, handler);
    }

    private getSocket(): ClientSocket {
        // This line cannot be tested since it would connect to the real socket in the tests since it is impossible to mock io()
        return io(environment.serverUrlWebsocket, { transports: ['websocket'], upgrade: false });
    }
}
