import { Injectable } from '@angular/core';
import { SOCKET_ID_UNDEFINED } from '@app/constants/services-errors';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { ClientSocket } from '@app/classes/communication/socket-type';
import { AlertService } from '@app/services/alert-service/alert.service';
import { authenticationSettings } from '@app/utils/settings';
import { Observable, Subject } from 'rxjs';
@Injectable({
    providedIn: 'root',
})
export default class SocketService {
    socket: ClientSocket;
    socketError: Subject<{ message: string; code: number }> = new Subject();

    constructor(private alertService: AlertService) {}

    connectSocket(): Observable<boolean> {
        const subject = new Subject<boolean>();

        if (this.socket) this.socket.disconnect();

        this.socket = this.getSocket();

        this.socket.on('connect', () => subject.next(true));
        this.socket.on('connect_error', () => subject.next(false));

        this.socket.on('error', (message: string, code: number) => {
            this.socketError.next({ message, code });
            this.alertService.error(message, { log: `Error ${code}: ${message}` });
        });

        return subject.asObservable();
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
        return io(environment.serverUrlWebsocket, {
            transports: ['websocket'],
            upgrade: false,
            auth: {
                token: authenticationSettings.getToken(),
            },
        });
    }
}
