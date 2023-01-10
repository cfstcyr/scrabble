import { Injectable } from '@angular/core';
import { ConnectionState } from '@app/classes/connection-state-service/connection-state';
import ConnectionStateService from '@app/classes/connection-state-service/connection-state-service';
import { SOCKET_ID_UNDEFINED } from '@app/constants/services-errors';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
@Injectable({
    providedIn: 'root',
})
export default class SocketService extends ConnectionStateService {
    private socket: Socket;

    initializeService(): void {
        this.socket = this.getSocket();
        this.socket.on('connect', () => this.nextState(ConnectionState.Connected)).on('connect_error', () => this.nextState(ConnectionState.Error));
    }

    getId(): string {
        if (!this.socket) throw new Error(SOCKET_ID_UNDEFINED);

        return this.socket.id;
    }

    on<T>(ev: string, handler: (arg: T) => void): void {
        if (!this.socket) {
            return;
        }
        this.socket.on(ev, handler);
    }

    private getSocket(): Socket {
        // This line cannot be tested since it would connect to the real socket in the tests since it is impossible to mock io()
        return io(environment.serverUrlWebsocket, { transports: ['websocket'], upgrade: false });
    }
}
