import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MAX_TILES_PER_PLAYER } from '@app/constants/game-constants';
import { Subject } from 'rxjs';
import { Player } from '@app/classes/player';
import RoundManagerService from '@app/services/round-manager-service/round-manager.service';
import { GameService } from '@app/services';
import { GameViewEventManagerService } from '@app/services/game-view-event-manager-service/game-view-event-manager.service';
import { takeUntil } from 'rxjs/operators';
import { LetterValue, Tile } from '@app/classes/tile';

interface GamePlayer {
    isActive: boolean;
    player: Player;
    tilesLeft: number;
    tilesLeftTile: Tile;
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
    player1: GamePlayer = {
        isActive: false,
        player: new Player('', { username: 'Player1', email: '', avatar: '' }, []),
        tilesLeft: 0,
        tilesLeftTile: {} as Tile,
    };
    player2: GamePlayer = {
        isActive: false,
        player: new Player('', { username: 'Player2', email: '', avatar: '' }, []),
        tilesLeft: 0,
        tilesLeftTile: {} as Tile,
    };
    player3: GamePlayer = {
        isActive: false,
        player: new Player('', { username: 'Player3', email: '', avatar: '' }, []),
        tilesLeft: 0,
        tilesLeftTile: {} as Tile,
    };
    player4: GamePlayer = {
        isActive: false,
        player: new Player('', { username: 'Player4', email: '', avatar: '' }, []),
        tilesLeft: 0,
        tilesLeftTile: {} as Tile,
    };
    private componentDestroyed$: Subject<boolean>;

    constructor(
        private readonly roundManager: RoundManagerService,
        private readonly gameService: GameService,
        private readonly gameViewEventManagerService: GameViewEventManagerService,
    ) {}

    get players(): GamePlayer[] {
        return [this.player1, this.player2, this.player3, this.player4];
    }

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
        this.player1 = this.buildGamePlayer(1, activePlayer);
        this.player2 = this.buildGamePlayer(2, activePlayer);
        this.player3 = this.buildGamePlayer(3, activePlayer);
        this.player4 = this.buildGamePlayer(4, activePlayer);
    }

    private buildGamePlayer(playerNumber: number, activePlayer: Player | undefined): GamePlayer {
        const player =
            this.gameService.getPlayerByNumber(playerNumber) ?? new Player('', { username: 'Player' + playerNumber, email: '', avatar: '' }, []);

        return {
            isActive: !!activePlayer && activePlayer.id === this.gameService.getPlayerByNumber(playerNumber)?.id,
            player,
            tilesLeft: player.getTiles().length,
            tilesLeftTile: { letter: `${player.getTiles().length}` as LetterValue, value: 0 },
        };
    }
}
