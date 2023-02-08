import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DB_CONNECTED_ENDPOINT } from '@app/constants/services-errors';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class DatabaseService {
    constructor(private readonly http: HttpClient) {}

    ping(): Observable<void> {
        return this.http.get(DB_CONNECTED_ENDPOINT).pipe(
            map(() => {
                /**/
            }),
        );
    }
}
