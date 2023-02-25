import { HttpClient, HttpStatusCode } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { PlayerData, PlayerName } from '@app/classes/communication/';
import { GameConfig, GameConfigData, InitializeGameData, StartGameData } from '@app/classes/communication/game-config';
import SocketService from '@app/services/socket-service/socket.service';
import { Group } from '@common/models/group';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class GameDispatcherController implements OnDestroy {
    private joinRequestEvent: Subject<string> = new Subject();
    private canceledGameEvent: Subject<string> = new Subject();
    private playerJoinedGroupEvent: Subject<PlayerData[]> = new Subject();
    private playerLeftGroupEvent: Subject<PlayerData[]> = new Subject();
    private groupFullEvent: Subject<void> = new Subject();
    private groupRequestValidEvent: Subject<void> = new Subject();
    private groupsUpdateEvent: Subject<Group[]> = new Subject();
    private joinerRejectedEvent: Subject<string> = new Subject();
    private initializeGame$: BehaviorSubject<InitializeGameData | undefined> = new BehaviorSubject<InitializeGameData | undefined>(undefined);

    private serviceDestroyed$: Subject<boolean> = new Subject();

    constructor(private http: HttpClient, public socketService: SocketService) {
        this.configureSocket();
    }

    ngOnDestroy(): void {
        this.serviceDestroyed$.next(true);
        this.serviceDestroyed$.complete();
    }

    handleGameCreation(gameConfig: GameConfigData): Observable<{ group: Group }> {
        const endpoint = `${environment.serverUrl}/games`;
        return this.http.post<{ group: Group }>(endpoint, gameConfig);
    }

    handleConfirmationGameCreation(opponentName: string, gameId: string): Observable<void> {
        const endpoint = `${environment.serverUrl}/games/${gameId}/players/accept`;
        return this.http.post<void>(endpoint, { opponentName });
    }

    handleStartGame(gameId: string): Observable<void> {
        const endpoint = `${environment.serverUrl}/games/${gameId}/players/start`;
        return this.http.post<void>(endpoint, {});
    }

    handleRejectionGameCreation(opponentName: string, gameId: string): void {
        const endpoint = `${environment.serverUrl}/games/${gameId}/players/reject`;
        this.http.post(endpoint, { opponentName }).subscribe();
    }

    handleCancelGame(gameId: string): void {
        const endpoint = `${environment.serverUrl}/games/${gameId}/players/cancel`;
        this.http.delete(endpoint).subscribe();
    }

    handleGroupsListRequest(): void {
        const endpoint = `${environment.serverUrl}/games`;
        this.http.get(endpoint).subscribe();
    }

    handleGroupJoinRequest(gameId: string, playerName: string): void {
        const endpoint = `${environment.serverUrl}/games/${gameId}/players/join`;
        this.http.post<GameConfig>(endpoint, { playerName }, { observe: 'response' }).subscribe(
            () => {
                this.groupRequestValidEvent.next();
            },
            (error) => {
                this.handleJoinError(error.status as HttpStatusCode);
            },
        );
    }

    subscribeToJoinRequestEvent(serviceDestroyed$: Subject<boolean>, callback: (opponentName: string) => void): void {
        this.joinRequestEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }

    subscribeToCanceledGameEvent(serviceDestroyed$: Subject<boolean>, callback: (hostName: string) => void): void {
        this.canceledGameEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }

    subscribeToPlayerJoinedGroupEvent(serviceDestroyed$: Subject<boolean>, callback: (players: PlayerData[]) => void): void {
        this.playerJoinedGroupEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }

    subscribeToPlayerLeftGroupEvent(serviceDestroyed$: Subject<boolean>, callback: (players: PlayerData[]) => void): void {
        this.playerLeftGroupEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }

    subscribeToGroupFullEvent(serviceDestroyed$: Subject<boolean>, callback: () => void): void {
        this.groupFullEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }

    subscribeToGroupRequestValidEvent(serviceDestroyed$: Subject<boolean>, callback: () => void): void {
        this.groupRequestValidEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }

    subscribeToGroupsUpdateEvent(serviceDestroyed$: Subject<boolean>, callback: (lobbies: Group[]) => void): void {
        this.groupsUpdateEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }

    subscribeToJoinerRejectedEvent(serviceDestroyed$: Subject<boolean>, callback: (hostName: string) => void): void {
        this.joinerRejectedEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }

    subscribeToInitializeGame(serviceDestroyed$: Subject<boolean>, callback: (value: InitializeGameData | undefined) => void): void {
        this.initializeGame$.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }

    private handleJoinError(errorStatus: HttpStatusCode): void {
        if (errorStatus === HttpStatusCode.Unauthorized) {
            this.groupFullEvent.next();
        } else if (errorStatus === HttpStatusCode.Gone) {
            this.canceledGameEvent.next('Le créateur');
        }
    }

    private configureSocket(): void {
        this.socketService.on('joinRequest', (opponent: PlayerName) => {
            this.joinRequestEvent.next(opponent.name);
        });
        this.socketService.on('startGame', (startGameData: StartGameData) => {
            this.initializeGame$.next({ localPlayerId: this.socketService.getId(), startGameData });
        });
        this.socketService.on('groupsUpdate', (groups: Group[]) => {
            this.groupsUpdateEvent.next(groups);
        });
        this.socketService.on('rejected', (hostName: PlayerName) => {
            this.joinerRejectedEvent.next(hostName.name);
        });
        this.socketService.on('canceledGame', (opponent: PlayerName) => this.canceledGameEvent.next(opponent.name));
        this.socketService.on('player_joined', (players: PlayerData[]) => this.playerJoinedGroupEvent.next(players));
        this.socketService.on('joinerLeaveGame', (players: PlayerData[]) => this.playerLeftGroupEvent.next(players));
    }
}
