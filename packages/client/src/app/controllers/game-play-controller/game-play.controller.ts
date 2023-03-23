import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActionData } from '@app/classes/actions/action-data';
import { Position } from '@app/classes/board-navigator/position';
import GameUpdateData from '@app/classes/communication/game-update-data';
import { Message } from '@app/classes/communication/message';
import { HTTP_ABORT_ERROR } from '@app/constants/controllers-errors';
import SocketService from '@app/services/socket-service/socket.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class GamePlayController {
    private gameUpdate$ = new BehaviorSubject<GameUpdateData>({});
    private newMessage$ = new BehaviorSubject<Message | null>(null);
    private firstSquareSelectedPosition$ = new BehaviorSubject<Position | null>(null);
    private actionDone$ = new Subject<void>();

    constructor(private http: HttpClient, private readonly socketService: SocketService) {
        this.configureSocket();
    }

    sendAction(gameId: string, action: ActionData): void {
        const endpoint = `${environment.serverUrl}/games/${gameId}/players/action`;
        this.http.post(endpoint, action).subscribe(() => {
            this.actionDone$.next();
        });
    }

    sendMessage(gameId: string, message: Message): void {
        const endpoint = `${environment.serverUrl}/games/${gameId}/players/message`;
        this.http.post(endpoint, message).subscribe();
    }

    sendError(gameId: string, message: Message): void {
        const endpoint = `${environment.serverUrl}/games/${gameId}/players/error`;
        this.http.post(endpoint, message).subscribe();
    }

    handleReconnection(gameId: string, newPlayerId: string): void {
        const endpoint = `${environment.serverUrl}/games/${gameId}/players/reconnect`;
        this.http.post(endpoint, { newPlayerId }).subscribe();
    }

    handleDisconnection(gameId: string): void {
        const endpoint = `${environment.serverUrl}/games/${gameId}/players/disconnect`;
        // When reloading the page, a disconnect http request is fired on destruction of the game-page component.
        // In the initialization of the game-page component, a reconnect request is made which does not allow the
        // server to send a response, triggering a Abort 0  error code which is why we catch it if it this this code
        this.http.delete(endpoint, { observe: 'response' }).subscribe(this.handleDisconnectResponse, this.handleDisconnectError);
    }

    handleFirstSquareSelected(gameId: string, position: Position): void {
        const endpoint = `${environment.serverUrl}/games/${gameId}/squares/select`;
        this.http.post(endpoint, position).subscribe();
    }

    handleFirstSquareCancelled(gameId: string): void {
        const endpoint = `${environment.serverUrl}/games/${gameId}/squares/cancel`;
        this.http.delete(endpoint).subscribe();
    }

    observeGameUpdate(): Observable<GameUpdateData> {
        return this.gameUpdate$.asObservable();
    }

    observeNewMessage(): Observable<Message | null> {
        return this.newMessage$.asObservable();
    }

    observeActionDone(): Observable<void> {
        return this.actionDone$.asObservable();
    }

    observeFirstSquareSelectedPosition(): Observable<Position | null> {
        return this.firstSquareSelectedPosition$.asObservable();
    }

    private configureSocket(): void {
        this.socketService.on('gameUpdate', (newData: GameUpdateData) => {
            this.gameUpdate$.next(newData);
        });
        this.socketService.on('newMessage', (newMessage: Message) => {
            this.newMessage$.next(newMessage);
        });
        this.socketService.on('firstSquareSelected', (position: Position) => {
            this.firstSquareSelectedPosition$.next(position);
        });
        this.socketService.on('firstSquareCancelled', () => {
            this.firstSquareSelectedPosition$.next(null);
        });
    }

    private handleDisconnectResponse(): void {
        return;
    }

    private handleDisconnectError(error: { message: string; status: number }): void {
        if (error.status !== HTTP_ABORT_ERROR) throw new Error(error.message);
    }
}
