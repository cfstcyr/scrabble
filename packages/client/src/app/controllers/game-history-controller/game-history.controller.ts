import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GameHistoriesData } from '@app/classes/communication/game-histories';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class GameHistoryController {
    private endpoint = `${environment.serverUrl}/gameHistories`;

    constructor(private readonly http: HttpClient) {}

    getGameHistories(): Observable<GameHistoriesData> {
        return this.http.get<GameHistoriesData>(this.endpoint);
    }

    resetGameHistories(): Observable<void> {
        return this.http.delete<void>(this.endpoint);
    }
}
