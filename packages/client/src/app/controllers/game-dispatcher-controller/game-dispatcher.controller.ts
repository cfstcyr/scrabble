import { HttpClient, HttpStatusCode } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { LobbyData, LobbyInfo, PlayerData, PlayerName } from '@app/classes/communication/';
import { GameConfig, GameConfigData, InitializeGameData, StartGameData } from '@app/classes/communication/game-config';
import SocketService from '@app/services/socket-service/socket.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class GameDispatcherController implements OnDestroy {
    private joinRequestEvent: Subject<string> = new Subject();
    private canceledGameEvent: Subject<string> = new Subject();
    private playerJoinedGroupEvent: Subject<PlayerData> = new Subject();
    private playerLeftGroupEvent: Subject<PlayerData> = new Subject();
    private lobbyFullEvent: Subject<void> = new Subject();
    private lobbyRequestValidEvent: Subject<void> = new Subject();
    private lobbiesUpdateEvent: Subject<LobbyInfo[]> = new Subject();
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

    handleGameCreation(gameConfig: GameConfigData): Observable<{ lobbyData: LobbyData }> {
        const endpoint = `${environment.serverUrl}/games/${this.socketService.getId()}`;
        return this.http.post<{ lobbyData: LobbyData }>(endpoint, gameConfig);
    }

    handleConfirmationGameCreation(opponentName: string, gameId: string): Observable<void> {
        const endpoint = `${environment.serverUrl}/games/${gameId}/players/${this.socketService.getId()}/accept`;
        return this.http.post<void>(endpoint, { opponentName });
    }

    handleStartGame(gameId: string): Observable<void> {
        const endpoint = `${environment.serverUrl}/games/${gameId}/players/${this.socketService.getId()}/start`;
        return this.http.post<void>(endpoint, {});
    }

    handleRejectionGameCreation(opponentName: string, gameId: string): void {
        const endpoint = `${environment.serverUrl}/games/${gameId}/players/${this.socketService.getId()}/reject`;
        this.http.post(endpoint, { opponentName }).subscribe();
    }

    handleCancelGame(gameId: string): void {
        const endpoint = `${environment.serverUrl}/games/${gameId}/players/${this.socketService.getId()}/cancel`;
        this.http.delete(endpoint).subscribe();
    }

    handleLobbiesListRequest(): void {
        const endpoint = `${environment.serverUrl}/games/${this.socketService.getId()}`;
        this.http.get(endpoint).subscribe();
    }

    handleLobbyJoinRequest(gameId: string, playerName: string): void {
        const endpoint = `${environment.serverUrl}/games/${gameId}/players/${this.socketService.getId()}/join`;
        this.http.post<GameConfig>(endpoint, { playerName }, { observe: 'response' }).subscribe(
            () => {
                this.lobbyRequestValidEvent.next();
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

    subscribeToPlayerJoinedGroupEvent(serviceDestroyed$: Subject<boolean>, callback: (player: PlayerData) => void): void {
        this.playerJoinedGroupEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }

    subscribeToPlayerLeftGroupEvent(serviceDestroyed$: Subject<boolean>, callback: (player: PlayerData) => void): void {
        this.playerJoinedGroupEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }

    subscribeToLobbyFullEvent(serviceDestroyed$: Subject<boolean>, callback: () => void): void {
        this.lobbyFullEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }

    subscribeToLobbyRequestValidEvent(serviceDestroyed$: Subject<boolean>, callback: () => void): void {
        this.lobbyRequestValidEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }

    subscribeToLobbiesUpdateEvent(serviceDestroyed$: Subject<boolean>, callback: (lobbies: LobbyInfo[]) => void): void {
        this.lobbiesUpdateEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }

    subscribeToJoinerRejectedEvent(serviceDestroyed$: Subject<boolean>, callback: (hostName: string) => void): void {
        this.joinerRejectedEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }

    subscribeToInitializeGame(serviceDestroyed$: Subject<boolean>, callback: (value: InitializeGameData | undefined) => void): void {
        this.initializeGame$.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }

    private handleJoinError(errorStatus: HttpStatusCode): void {
        if (errorStatus === HttpStatusCode.Unauthorized) {
            this.lobbyFullEvent.next();
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
        this.socketService.on('lobbiesUpdate', (lobbies: LobbyInfo[]) => {
            this.lobbiesUpdateEvent.next(lobbies);
        });
        this.socketService.on('rejected', (hostName: PlayerName) => {
            this.joinerRejectedEvent.next(hostName.name);
        });
        this.socketService.on('canceledGame', (opponent: PlayerName) => this.canceledGameEvent.next(opponent.name));
        this.socketService.on('player_joined', (player: PlayerData) => this.playerJoinedGroupEvent.next(player));
        this.socketService.on('joinerLeaveGame', (player: PlayerData) => this.playerLeftGroupEvent.next(player));
    }
}
