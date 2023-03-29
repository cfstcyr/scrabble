import { Component, OnDestroy, OnInit } from '@angular/core';
import RoundManagerService from '@app/services/round-manager-service/round-manager.service';
import { MAX_TILES_PER_PLAYER } from '@app/constants/game-constants';
import { GameService } from '@app/services';
import { GameViewEventManagerService } from '@app/services/game-view-event-manager-service/game-view-event-manager.service';
import { Subject } from 'rxjs';
import { Player } from '@app/classes/player';
import { TileReserveData } from '@app/classes/tile/tile.types';
import { takeUntil } from 'rxjs/operators';

interface GamePlayer {
    isActive: boolean;
    player: Player;
}

@Component({
    selector: 'app-game-players',
    templateUrl: './game-players.component.html',
    styleUrls: ['./game-players.component.scss'],
})
export class GamePlayersComponent implements OnInit, OnDestroy {
    readonly maxTilesPerPlayer = MAX_TILES_PER_PLAYER;
    localPlayer: GamePlayer;
    adversaryPlayers: GamePlayer[] = [];
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
            this.updateActivePlayerBorder(this.roundManager.getActivePlayer());
        });

        if (!this.gameService.isGameSetUp) return;
        this.setupGame();
    }
    ngOnDestroy(): void {
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.complete();
    }

    isActive(): boolean {
        return this.gameService.isLocalPlayerPlaying();
    }

    getLocalPlayer(): Player {
        return this.gameService.getLocalPlayer() ?? new Player('', { username: 'Player1', email: '', avatar: '' }, []);
    }

    get adversary1(): GamePlayer {
        return this.adversaryPlayers[0] ?? { isActive: false, player: new Player('', { username: 'Player2', email: '', avatar: '' }, []) };
    }

    get adversary2(): GamePlayer {
        return this.adversaryPlayers[1] ?? { isActive: false, player: new Player('', { username: 'Player3', email: '', avatar: '' }, []) };
    }

    get adversary3(): GamePlayer {
        return this.adversaryPlayers[2] ?? { isActive: false, player: new Player('', { username: 'Player4', email: '', avatar: '' }, []) };
    }

    getLettersLeft(): TileReserveData[] {
        return this.gameService.tileReserve;
    }

    getNumberOfTilesLeft(): number {
        return this.gameService.getTotalNumberOfTilesLeft();
    }

    private setupGame(): void {
        if (this.roundManager.timer) {
            this.roundManager.timer.pipe(takeUntil(this.componentDestroyed$)).subscribe(([, activePlayer]) => {
                this.updateActivePlayerBorder(activePlayer);
            });
        }
    }

    private updateActivePlayerBorder(activePlayer: Player | undefined): void {
        const localPlayer = this.gameService.getLocalPlayer();

        this.localPlayer = {
            isActive: !!localPlayer && !!activePlayer && activePlayer.id === localPlayer.id,
            player: localPlayer ?? new Player('', { username: 'Player', email: '', avatar: '' }, []),
        };

        this.adversaryPlayers = [];
        for (const adversary of this.gameService.getAdversaries()) {
            this.adversaryPlayers.push({
                isActive: !!adversary && !!activePlayer && activePlayer.id === adversary.id,
                player: adversary ?? new Player('', { username: 'Player', email: '', avatar: '' }, []),
            });
        }
    }
}
