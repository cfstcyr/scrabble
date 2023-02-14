import { Injectable } from '@angular/core';
import SocketService from '@app/services/socket-service/socket.service';
import { BehaviorSubject, of, Observable } from 'rxjs';
import { DatabaseService } from '@app/services/database-service/database.service';
import { AppState, InitializeState } from '@app/classes/connection-state-service/connection-state';
import {
    RECONNECTION_DELAY,
    RECONNECTION_RETRIES,
    STATE_ERROR_DATABASE_NOT_CONNECTED_MESSAGE,
    STATE_ERROR_SERVER_NOT_CONNECTED_MESSAGE,
    STATE_LOADING_MESSAGE,
} from '@app/constants/services-errors';
import { catchError, delay, map, retryWhen, take, takeWhile, tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class InitializerService {
    state: BehaviorSubject<AppState>;

    constructor(private readonly socketService: SocketService, private readonly databaseService: DatabaseService) {
        // this.state = new BehaviorSubject<AppState>({
        //     state: InitializeState.Loading,
        //     message: STATE_LOADING_MESSAGE,
        // });
        this.state = new BehaviorSubject<AppState>({
            state: InitializeState.Ready,
        });
    }

    load() {
        this.state.next({
            state: InitializeState.Loading,
            message: STATE_LOADING_MESSAGE,
        });
    }

    ready() {
        this.state.next({
            state: InitializeState.Ready,
        });
    }

    initialize(): void {
        (async () => {
            await this.connectToSocket().toPromise();

            const connectedToDatabase = await this.pingDatabase().toPromise();

            if (!connectedToDatabase) {
                this.state.next({
                    state: InitializeState.Error,
                    message: STATE_ERROR_DATABASE_NOT_CONNECTED_MESSAGE,
                });

                return;
            }

            this.state.next({ state: InitializeState.Ready });
        })();
    }

    private connectToSocket(): Observable<boolean> {
        return this.socketService.connectSocket().pipe(
            tap((connected) => {
                if (!connected) {
                    this.state.next({
                        state: InitializeState.Trying,
                        message: STATE_ERROR_SERVER_NOT_CONNECTED_MESSAGE,
                    });
                }
            }),
            takeWhile((connected) => !connected),
        );
    }

    private pingDatabase(): Observable<boolean> {
        return this.databaseService.ping().pipe(
            retryWhen((errors) => {
                this.state.next({
                    state: InitializeState.Trying,
                    message: STATE_ERROR_DATABASE_NOT_CONNECTED_MESSAGE,
                });
                return errors.pipe(delay(RECONNECTION_DELAY), take(RECONNECTION_RETRIES));
            }),
            map(() => true),
            catchError(() => of(false)),
            take(1),
        );
    }
}
