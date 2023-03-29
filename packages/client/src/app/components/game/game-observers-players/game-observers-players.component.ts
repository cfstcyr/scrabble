import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MAX_TILES_PER_PLAYER } from '@app/constants/game-constants';
import { Subject } from 'rxjs';
import { Player } from '@app/classes/player';
import RoundManagerService from '@app/services/round-manager-service/round-manager.service';
import { GameService } from '@app/services';
import { GameViewEventManagerService } from '@app/services/game-view-event-manager-service/game-view-event-manager.service';
import { takeUntil } from 'rxjs/operators';

interface GamePlayer {
    isActive: boolean;
    player: Player;
}
@Component({
    selector: 'app-game-observers-players',
    templateUrl: './game-observers-players.component.html',
    styleUrls: ['./game-observers-players.component.scss'],
})
export class GameObserversPlayersComponent implements OnInit, OnDestroy {
    @Output() playerClick = new EventEmitter<number>();
    @Input() observedPlayerId: string | undefined;

    readonly maxTilesPerPlayer = MAX_TILES_PER_PLAYER;
    player1: GamePlayer;
    player2: GamePlayer;
    player3: GamePlayer;
    player4: GamePlayer;
    private componentDestroyed$: Subject<boolean>;

    constructor(
        private readonly roundManager: RoundManagerService,
        private readonly gameService: GameService,
        private readonly gameViewEventManagerService: GameViewEventManagerService,
    ) {}

    ngOnInit(): void {
        this.componentDestroyed$ = new Subject();
        this.gameViewEventManagerService.subscribeToGameViewEvent('reRender', this.componentDestroyed$, () => {
            this.ngOnDestroy();
            this.ngOnInit();
            this.updatePlayers(this.roundManager.getActivePlayer());
        });

        if (!this.gameService.isGameSetUp) return;
        this.setupGame();
    }

    ngOnDestroy(): void {
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.complete();
    }

    private setupGame(): void {
        if (this.roundManager.timer) {
            this.roundManager.timer.pipe(takeUntil(this.componentDestroyed$)).subscribe(([, activePlayer]) => {
                this.updatePlayers(activePlayer);
            });
        }
    }

    private updatePlayers(activePlayer: Player | undefined): void {
        this.player1 = {
            isActive: !!activePlayer && activePlayer.id === this.gameService.getPlayerByNumber(1)?.id,
            player: this.gameService.getPlayerByNumber(1) ?? new Player('', { username: 'Player1', email: '', avatar: '' }, []),
        };
        this.player2 = {
            isActive: !!activePlayer && activePlayer.id === this.gameService.getPlayerByNumber(2)?.id,
            player: this.gameService.getPlayerByNumber(2) ?? new Player('', { username: 'Player2', email: '', avatar: '' }, []),
        };
        this.player3 = {
            isActive: !!activePlayer && activePlayer.id === this.gameService.getPlayerByNumber(3)?.id,
            player: this.gameService.getPlayerByNumber(3) ?? new Player('', { username: 'Player3', email: '', avatar: '' }, []),
        };
        this.player4 = {
            isActive: !!activePlayer && activePlayer.id === this.gameService.getPlayerByNumber(4)?.id,
            player: this.gameService.getPlayerByNumber(4) ?? new Player('', { username: 'Player4', email: '', avatar: '' }, []),
        };
    }
}
