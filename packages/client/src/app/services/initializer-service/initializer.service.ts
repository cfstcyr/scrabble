import { Injectable } from '@angular/core';
import { BehaviorSubject, of, Observable } from 'rxjs';
import { DatabaseService } from '@app/services/database-service/database.service';
import { AppState, InitializeState } from '@app/classes/connection-state-service/connection-state';
import {
    RECONNECTION_DELAY,
    RECONNECTION_RETRIES,
    STATE_ERROR_DATABASE_NOT_CONNECTED_MESSAGE,
    STATE_LOADING_MESSAGE,
} from '@app/constants/services-errors';
import { catchError, delay, map, retryWhen, take } from 'rxjs/operators';
import { AuthenticationService } from '@app/services/authentication-service/authentication.service';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root',
})
export class InitializerService {
    state: BehaviorSubject<AppState>;

    constructor(
        private readonly databaseService: DatabaseService,
        private readonly authenticationService: AuthenticationService,
        private readonly router: Router,
    ) {
        this.state = new BehaviorSubject<AppState>({
            state: InitializeState.Loading,
            message: STATE_LOADING_MESSAGE,
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
            const connectedToDatabase = await this.pingDatabase().toPromise();

            if (!connectedToDatabase) {
                this.state.next({
                    state: InitializeState.Error,
                    message: STATE_ERROR_DATABASE_NOT_CONNECTED_MESSAGE,
                });

                return;
            }

            const tokenValidated = await this.authenticationService.validateToken().toPromise();

            if (!tokenValidated) {
                this.router.navigate(['/login']);
            }

            this.state.next({ state: InitializeState.Ready });
        })();
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
