/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Injectable, OnDestroy } from '@angular/core';
import { Player } from '@app/classes/player';
import { PlayerContainer } from '@app/classes/player/player-container';
import { Square } from '@app/classes/square';
import { MultiplierEffect } from '@app/classes/square/score-multiplier';
import { TileReserveData } from '@app/classes/tile/tile.types';
import { BoardService } from '@app/services';
import { of, Subject } from 'rxjs';

const LOCAL_PLAYER_ID = '1';

@Injectable({
    providedIn: 'root',
})
export class InitializedGameService implements OnDestroy {
    tileReserve: TileReserveData[] = [
        { letter: 'A', amount: 10 },
        { letter: 'B', amount: 10 },
        { letter: 'C', amount: 10 },
        { letter: 'D', amount: 10 },
        { letter: 'E', amount: 10 },
        { letter: 'F', amount: 10 },
        { letter: 'G', amount: 10 },
    ];
    playerContainer = new PlayerContainer(LOCAL_PLAYER_ID).initializePlayers([
        {
            id: LOCAL_PLAYER_ID,
            score: 0,
            tiles: [
                { letter: 'A', value: 1 },
                { letter: 'B', value: 1 },
                { letter: 'C', value: 1 },
                { letter: 'D', value: 1 },
                { letter: 'E', value: 1 },
            ],
            publicUser: { username: '1', avatar: '1', email: '1' },
        },
        { id: '2', score: 0, tiles: [], publicUser: { username: '2', avatar: '2', email: '2' } },
        { id: '3', score: 0, tiles: [], publicUser: { username: '3', avatar: '3', email: '3' } },
        { id: '4', score: 0, tiles: [], publicUser: { username: '4', avatar: '4', email: '4' } },
    ]);
    isGameSetUp = true;
    isGameOver = false;
    gameId = '10';
    protected serviceDestroyed$: Subject<boolean>;

    constructor(private readonly boardService: BoardService) {
        this.handleInitializeGame();
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    async handleInitializeGame() {
        const board = new Array(15).fill(0).map((_, row) =>
            new Array(15).fill(0).map<Square>((_1, column) => ({
                isCenter: false,
                position: { row, column },
                scoreMultiplier: null,
                tile: null,
                wasMultiplierUsed: false,
            })),
        );

        board[7][7].tile = { letter: 'A', value: 1 };
        board[2][2].scoreMultiplier = { multiplier: 2, multiplierEffect: MultiplierEffect.LETTER };

        this.boardService.initializeBoard(board);
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    ngOnDestroy(): void {}

    isLocalPlayerPlaying(): boolean {
        return true;
    }
    getGameId(): string {
        return 'game-id';
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    resetGameId(): void {}

    getPlayerByNumber(playerNumber: number): Player | undefined {
        return this.playerContainer.getPlayer(playerNumber);
    }

    getLocalPlayer(): Player | undefined {
        return this.playerContainer.getLocalPlayer();
    }

    getLocalPlayerId(): string | undefined {
        return this.playerContainer.getLocalPlayerId();
    }

    getTotalNumberOfTilesLeft(): number {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        return 999;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    resetServiceData(): void {}
}
