import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConnectionState } from '@app/classes/connection-state-service/connection-state';
import ConnectionStateService from '@app/classes/connection-state-service/connection-state-service';
import { DB_CONNECTED_ENDPOINT } from '@app/constants/services-errors';

@Injectable({
    providedIn: 'root',
})
export class DatabaseService extends ConnectionStateService {
    constructor(private readonly http: HttpClient) {
        super();
    }

    checkDatabase(): void {
        this.http.get(DB_CONNECTED_ENDPOINT).subscribe(
            () => this.nextState(ConnectionState.Connected),
            () => this.nextState(ConnectionState.Error),
        );
    }
}
