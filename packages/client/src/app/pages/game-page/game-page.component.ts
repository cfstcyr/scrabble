import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActionType } from '@app/classes/actions/action-data';
import { DefaultDialogComponent } from '@app/components/default-dialog/default-dialog.component';
import { TileRackComponent } from '@app/components/tile-rack/tile-rack.component';
import { ENTER } from '@app/constants/components-constants';
import {
    DIALOG_ABANDON_BUTTON_CONFIRM,
    DIALOG_ABANDON_BUTTON_CONTINUE,
    DIALOG_ABANDON_CONTENT,
    DIALOG_ABANDON_TITLE,
    DIALOG_END_OF_GAME_CLOSE_BUTTON,
    DIALOG_END_OF_GAME_TITLE,
    DIALOG_NO_ACTIVE_GAME_BUTTON,
    DIALOG_NO_ACTIVE_GAME_CONTENT,
    DIALOG_NO_ACTIVE_GAME_TITLE,
    DIALOG_QUIT_BUTTON_CONFIRM,
    DIALOG_QUIT_CONTENT,
    DIALOG_QUIT_STAY,
    DIALOG_QUIT_TITLE,
    MAX_CONFETTI_COUNT,
    MIN_CONFETTI_COUNT,
} from '@app/constants/pages-constants';
import { ROUTE_HOME } from '@app/constants/routes-constants';
import { GameService } from '@app/services';
import { ActionService } from '@app/services/action-service/action.service';
import { GameViewEventManagerService } from '@app/services/game-view-event-manager-service/game-view-event-manager.service';
import { PlayerLeavesService } from '@app/services/player-leave-service/player-leave.service';
import { ReconnectionService } from '@app/services/reconnection-service/reconnection.service';
import { TilePlacementService } from '@app/services/tile-placement-service/tile-placement.service';
import party from 'party-js';
import { DynamicSourceType } from 'party-js/lib/systems/sources';
import { Observable, Subject } from 'rxjs';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit, OnDestroy {
    @ViewChild(TileRackComponent, { static: false }) tileRackComponent: TileRackComponent;

    private mustDisconnectGameOnLeave: boolean;
    private componentDestroyed$: Subject<boolean>;

    constructor(
        public dialog: MatDialog,
        public gameService: GameService,
        private readonly reconnectionService: ReconnectionService,
        public surrenderDialog: MatDialog,
        private playerLeavesService: PlayerLeavesService,
        private gameViewEventManagerService: GameViewEventManagerService,
        private actionService: ActionService,
        private readonly tilePlacementService: TilePlacementService,
    ) {
        this.mustDisconnectGameOnLeave = true;
        this.componentDestroyed$ = new Subject();
    }

    @HostListener('document:keypress', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): void {
        switch (event.key) {
            case ENTER:
                this.gameService.playTilesOnBoard();
                break;
        }
    }
    @HostListener('document:keydown.escape', ['$event'])
    handleKeyboardEventEsc(): void {
        this.tilePlacementService.handleCancelPlacement();
    }

    @HostListener('window:beforeunload')
    ngOnDestroy(): void {
        if (this.mustDisconnectGameOnLeave) {
            this.reconnectionService.disconnectGame();
        }
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.complete();
    }

    ngOnInit(): void {
        this.gameViewEventManagerService.subscribeToGameViewEvent('noActiveGame', this.componentDestroyed$, () => this.noActiveGameDialog());
        this.gameViewEventManagerService.subscribeToGameViewEvent('endOfGame', this.componentDestroyed$, (winnerNames: string[]) =>
            this.endOfGameDialog(winnerNames),
        );
        if (!this.gameService.getGameId()) {
            this.reconnectionService.reconnectGame();
        }
    }

    hintButtonClicked(): void {
        this.actionService.sendAction(this.gameService.getGameId(), this.actionService.createActionData(ActionType.HINT, {}, '', true));
    }

    passButtonClicked(): void {
        this.gameService.makeTilePlacement([]);
        this.actionService.sendAction(this.gameService.getGameId(), this.actionService.createActionData(ActionType.PASS, {}, '', true));
    }

    placeButtonClicked(): void {
        this.gameService.playTilesOnBoard();
    }

    quitButtonClicked(): void {
        let title = '';
        let content = '';
        const buttonsContent = ['', ''];
        if (this.gameService.isGameOver) {
            title = DIALOG_QUIT_TITLE;
            content = DIALOG_QUIT_CONTENT;
            buttonsContent[0] = DIALOG_QUIT_BUTTON_CONFIRM;
            buttonsContent[1] = DIALOG_QUIT_STAY;
        } else {
            title = DIALOG_ABANDON_TITLE;
            content = DIALOG_ABANDON_CONTENT;
            buttonsContent[0] = DIALOG_ABANDON_BUTTON_CONFIRM;
            buttonsContent[1] = DIALOG_ABANDON_BUTTON_CONTINUE;
        }
        this.openDialog(title, content, buttonsContent);
    }

    canPlay(): boolean {
        return this.isLocalPlayerTurn() && !this.gameService.isGameOver && !this.actionService.hasActionBeenPlayed;
    }

    canPlaceWord(): Observable<boolean> {
        return this.tilePlacementService.isPlacementValid$;
    }

    private openDialog(title: string, content: string, buttonsContent: string[]): void {
        this.dialog.open(DefaultDialogComponent, {
            data: {
                title,
                content,
                buttons: [
                    {
                        content: buttonsContent[0],
                        redirect: ROUTE_HOME,
                        style: 'background-color: #FA6B84; color: rgb(0, 0, 0)',
                        // We haven't been able to test that the right function is called because this
                        // arrow function creates a new instance of the function. We cannot spy on it.
                        // It totally works tho, try it!
                        action: () => {
                            this.handlePlayerLeaves();
                            this.gameService.makeTilePlacement([]);
                        },
                    },
                    {
                        content: buttonsContent[1],
                        closeDialog: true,
                        style: 'background-color: rgb(231, 231, 231)',
                    },
                ],
            },
        });
    }

    private noActiveGameDialog(): void {
        this.dialog.open(DefaultDialogComponent, {
            data: {
                title: DIALOG_NO_ACTIVE_GAME_TITLE,
                content: DIALOG_NO_ACTIVE_GAME_CONTENT,
                buttons: [
                    {
                        content: DIALOG_NO_ACTIVE_GAME_BUTTON,
                        closeDialog: false,
                        redirect: ROUTE_HOME,
                        style: 'background-color: rgb(231, 231, 231)',
                        // We haven't been able to test that the right function is called because this
                        // arrow function creates a new instance of the function. We cannot spy on it.
                        // It totally works tho, try it!
                        action: () => (this.mustDisconnectGameOnLeave = false),
                    },
                ],
            },
        });
    }

    private endOfGameMessage(isLocalPlayerWinner: boolean) {
        const localPlayer = this.gameService.getLocalPlayer();
        const message = isLocalPlayerWinner ? 'Bravo pour votre victoire!' : 'Meilleure chance la prochaine fois!';
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const eloMessage = `Votre nouveau classement Elo est de ${Math.round(localPlayer?.adjustedRating ?? 1000)} (${
            Math.round(localPlayer?.ratingVariation ?? 0) >= 0 ? '+' : ''
        }${Math.round(localPlayer?.ratingVariation ?? 0)}).`;
        return `${message} ${eloMessage}`;
    }

    private endOfGameDialog(winnerNames: string[]): void {
        this.dialog.open(DefaultDialogComponent, {
            data: {
                title: DIALOG_END_OF_GAME_TITLE(this.isLocalPlayerWinner(winnerNames)),
                content: this.endOfGameMessage(this.isLocalPlayerWinner(winnerNames)),
                buttons: [
                    {
                        content: DIALOG_QUIT_BUTTON_CONFIRM,
                        redirect: ROUTE_HOME,
                        style: 'background-color: rgb(231, 231, 231)',
                        // We haven't been able to test that the right function is called because this
                        // arrow function creates a new instance of the function. We cannot spy on it.
                        // It totally works tho, try it!
                        action: () => this.handlePlayerLeaves(),
                    },
                    {
                        content: DIALOG_END_OF_GAME_CLOSE_BUTTON,
                        closeDialog: true,
                        style: 'background-color: rgb(231, 231, 231)',
                    },
                ],
            },
        });

        if (this.isLocalPlayerWinner(winnerNames)) this.throwConfettis();
    }

    private isLocalPlayerTurn(): boolean {
        return this.gameService.isLocalPlayerPlaying();
    }

    private handlePlayerLeaves(): void {
        this.mustDisconnectGameOnLeave = false;
        this.playerLeavesService.handleLocalPlayerLeavesGame();
    }

    private throwConfettis(): void {
        /* We have not been able to cover this line in the tests because it is impossible to spyOn the confetti method
        from the party-js package. This method is not exported from a class or a module, so jasmine does not offer a
        way to spy on it. Additionally, calling this method through in the tests would create some errors because the
        mat-dialog-container is not defined in the tests. */
        party.confetti(document.querySelector('.mat-dialog-container') as DynamicSourceType, {
            count: party.variation.range(MIN_CONFETTI_COUNT, MAX_CONFETTI_COUNT),
        });
    }

    private isLocalPlayerWinner(winnerNames: string[]): boolean {
        return winnerNames.includes(this.gameService.getLocalPlayer()?.publicUser.username ?? '');
    }
}
