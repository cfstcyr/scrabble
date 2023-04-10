import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Player } from '@app/classes/player';
import { MAX_TILES_PER_PLAYER } from '@app/constants/game-constants';
import { GameService } from '@app/services';
import { GameViewEventManagerService } from '@app/services/game-view-event-manager-service/game-view-event-manager.service';
import RoundManagerService from '@app/services/round-manager-service/round-manager.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

const VIRTUAL_PLAYER_ID_PREFIX = 'virtual-player';
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
    player1: GamePlayer = { isActive: false, player: new Player('', { username: 'Player1', email: '', avatar: '' }, []) };
    player2: GamePlayer = { isActive: false, player: new Player('', { username: 'Player2', email: '', avatar: '' }, []) };
    player3: GamePlayer = { isActive: false, player: new Player('', { username: 'Player3', email: '', avatar: '' }, []) };
    player4: GamePlayer = { isActive: false, player: new Player('', { username: 'Player4', email: '', avatar: '' }, []) };
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
    handleReplaceVirtualPlayerByObserver(virtualPlayerNumber: string) {
        this.gameService.replaceVirtualPlayer(virtualPlayerNumber);
    }
    isObservingVirtualPlayer(player: GamePlayer) {
        return player.player.id.includes(VIRTUAL_PLAYER_ID_PREFIX);
    }
    private setupGame(): void {
        if (this.roundManager.timer) {
            this.roundManager.timer.pipe(takeUntil(this.componentDestroyed$)).subscribe(([, activePlayer]) => {
                this.updatePlayers(activePlayer);
            });
        }
    }

    private updatePlayers(activePlayer: Player | undefined): void {
        this.player1 = this.buildGamePlayer(1, activePlayer);
        this.player2 = this.buildGamePlayer(2, activePlayer);
        this.player3 = this.buildGamePlayer(3, activePlayer);
        this.player4 = this.buildGamePlayer(4, activePlayer);
    }
    private buildGamePlayer(playerNumber: number, activePlayer: Player | undefined): GamePlayer {
        return {
            isActive: !!activePlayer && activePlayer.id === this.gameService.getPlayerByNumber(playerNumber)?.id,
            player:
                this.gameService.getPlayerByNumber(playerNumber) ?? new Player('', { username: 'Player' + playerNumber, email: '', avatar: '' }, []),
        };
    }
}
