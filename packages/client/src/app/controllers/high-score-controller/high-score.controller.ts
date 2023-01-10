import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HighScore } from '@app/classes/admin';
import SocketService from '@app/services/socket-service/socket.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class HighScoresController {
    private endpoint = `${environment.serverUrl}/highScores`;
    private highScoresListEvent: Subject<HighScore[]> = new Subject<HighScore[]>();

    constructor(private http: HttpClient, public socketService: SocketService) {
        this.configureSocket();
    }

    handleGetHighScores(): void {
        this.http.get(`${this.endpoint}/${this.socketService.getId()}`).subscribe();
    }

    resetHighScores(): void {
        this.http.delete(this.endpoint).subscribe(() => this.handleGetHighScores());
    }

    subscribeToHighScoresListEvent(serviceDestroyed$: Subject<boolean>, callback: (highScores: HighScore[]) => void): void {
        this.highScoresListEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }

    private configureSocket(): void {
        this.socketService.on('highScoresList', (highScores: HighScore[]) => {
            this.highScoresListEvent.next(highScores);
        });
    }
}
