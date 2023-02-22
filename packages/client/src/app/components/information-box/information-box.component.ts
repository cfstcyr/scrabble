import { Component, OnDestroy, OnInit } from '@angular/core';
import { Player } from '@app/classes/player';
import { Timer } from '@app/classes/round/timer';
import { TileReserveData } from '@app/classes/tile/tile.types';
// import { IconName } from '@app/components/icon/icon.component.type';
// import { LOCAL_PLAYER_ICON } from '@app/constants/components-constants';
import {
    MAX_TILES_PER_PLAYER,
    PLAYER_1_INDEX,
    PLAYER_2_INDEX,
    PLAYER_3_INDEX,
    PLAYER_4_INDEX,
    SECONDS_TO_MILLISECONDS,
} from '@app/constants/game-constants';
import { GameService } from '@app/services';
import { GameViewEventManagerService } from '@app/services/game-view-event-manager-service/game-view-event-manager.service';
import RoundManagerService from '@app/services/round-manager-service/round-manager.service';
import { Observable, Subject, Subscription, timer as timerCreationFunction } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-information-box',
    templateUrl: './information-box.component.html',
    styleUrls: ['./information-box.component.scss'],
})
export class InformationBoxComponent implements OnInit, OnDestroy {
    readonly maxTilesPerPlayer;
    isPlayer1Active: boolean;
    isPlayer2Active: boolean;
    isPlayer3Active: boolean;
    isPlayer4Active: boolean;
    playerNumber: number;
    // localPlayerIcon: IconName;
    timer: Timer;

    private timerSource: Observable<number>;
    private timerSubscription: Subscription;
    private componentDestroyed$: Subject<boolean>;

    constructor(
        private roundManager: RoundManagerService,
        private gameService: GameService,
        private gameViewEventManagerService: GameViewEventManagerService,
    ) {
        this.maxTilesPerPlayer = MAX_TILES_PER_PLAYER;
    }

    ngOnInit(): void {
        this.timer = new Timer(0, 0);
        this.componentDestroyed$ = new Subject();
        this.gameViewEventManagerService.subscribeToGameViewEvent('reRender', this.componentDestroyed$, () => {
            this.onDestroy();
            this.ngOnInit();
            this.updateActivePlayerBorder(this.roundManager.getActivePlayer());
        });
        this.gameViewEventManagerService.subscribeToGameViewEvent('gameInitialized', this.componentDestroyed$, () => {
            // this.localPlayerIcon = this.getLocalPlayerIcon();
        });

        if (!this.gameService.isGameSetUp) return;
        this.setupGame();
    }

    ngOnDestroy(): void {
        this.onDestroy();
    }

    isActive(): boolean {
        return this.gameService.isLocalPlayerPlaying();
    }

    getPlayer1(): Player {
        const player1 = this.gameService.getPlayerByNumber(PLAYER_1_INDEX);
        return player1 ? player1 : new Player('', 'Player1', []);
    }

    getPlayer2(): Player {
        const player2 = this.gameService.getPlayerByNumber(PLAYER_2_INDEX);
        return player2 ? player2 : new Player('', 'Player2', []);
    }

    getPlayer3(): Player {
        const player3 = this.gameService.getPlayerByNumber(PLAYER_3_INDEX);
        return player3 ? player3 : new Player('', 'Player3', []);
    }

    getPlayer4(): Player {
        const player4 = this.gameService.getPlayerByNumber(PLAYER_4_INDEX);
        return player4 ? player4 : new Player('', 'Player4', []);
    }

    isTimerRunning(): boolean {
        return this.timerSubscription !== undefined && !this.timerSubscription.closed;
    }

    getLettersLeft(): TileReserveData[] {
        return this.gameService.tileReserve;
    }

    getNumberOfTilesLeft(): number {
        return this.gameService.getTotalNumberOfTilesLeft();
    }
    private onDestroy(): void {
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.complete();
    }

    private setupGame(): void {
        if (this.roundManager.timer) {
            this.roundManager.timer.pipe(takeUntil(this.componentDestroyed$)).subscribe(([timer, activePlayer]) => {
                this.startTimer(timer);
                this.updateActivePlayerBorder(activePlayer);
            });
        }
        this.roundManager.subscribeToEndRoundEvent(this.componentDestroyed$, () => this.endRound());
        // this.playerNumber = this.getPlayerNumber();
    }

    private startTimer(timer: Timer): void {
        this.timer = timer;
        this.timerSource = this.createTimer(SECONDS_TO_MILLISECONDS);
        this.timerSubscription = this.timerSource.pipe(takeUntil(this.componentDestroyed$)).subscribe(() => this.timer.decrement());
    }

    private endRound(): void {
        this.timer = new Timer(0, 0);
        if (this.timerSubscription) {
            this.timerSubscription.unsubscribe();
        }
    }

    private updateActivePlayerBorder(activePlayer: Player | undefined): void {
        const player1 = this.getPlayer1();
        const player2 = this.getPlayer2();
        const player3 = this.getPlayer3();
        const player4 = this.getPlayer4();
        if (!activePlayer) {
            this.isPlayer1Active = false;
            this.isPlayer2Active = false;
            this.isPlayer3Active = false;
            this.isPlayer4Active = false;
            return;
        }
        this.isPlayer1Active = player1 && activePlayer.id === player1.id;
        this.isPlayer2Active = player2 && activePlayer.id === player2.id;
        this.isPlayer3Active = player3 && activePlayer.id === player3.id;
        this.isPlayer4Active = player4 && activePlayer.id === player4.id;
    }

    private createTimer(length: number): Observable<number> {
        return timerCreationFunction(0, length);
    }
    // private getPlayerNumber(): number {
    //     if (this.gameService.getLocalPlayer() === this.gameService.getPlayerByNumber(PLAYER_1_INDEX)) return PLAYER_1_INDEX;
    //     else if (this.gameService.getLocalPlayer() === this.gameService.getPlayerByNumber(PLAYER_2_INDEX)) return PLAYER_2_INDEX;
    //     else if (this.gameService.getLocalPlayer() === this.gameService.getPlayerByNumber(PLAYER_3_INDEX)) return PLAYER_3_INDEX;
    //     else return PLAYER_4_INDEX;
    // }

    // private getLocalPlayerIcon(): IconName {
    //     return LOCAL_PLAYER_ICON[Math.floor(Math.random() * LOCAL_PLAYER_ICON.length)];
    // }
}
