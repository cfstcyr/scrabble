import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import LobbyInfo from '@app/classes/communication/lobby-info';
import { Timer } from '@app/classes/round/timer';
import { ConvertDialogComponent, ConvertResult } from '@app/components/convert-dialog/convert-dialog.component';
import { DefaultDialogComponent } from '@app/components/default-dialog/default-dialog.component';
import { ERROR_SNACK_BAR_CONFIG } from '@app/constants/components-constants';
import { getRandomFact } from '@app/constants/fun-facts-scrabble-constants';
import {
    DEFAULT_LOBBY,
    DIALOG_BUTTON_CONTENT_REJECTED,
    DIALOG_CONTENT,
    DIALOG_TITLE,
    HOST_WAITING_MESSAGE,
    KEEP_DATA,
    OPPONENT_FOUND_MESSAGE,
} from '@app/constants/pages-constants';
import { GameDispatcherService } from '@app/services/';
import { PlayerLeavesService } from '@app/services/player-leave-service/player-leave.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-create-waiting-page',
    templateUrl: './create-waiting-page.component.html',
    styleUrls: ['./create-waiting-page.component.scss'],
})
export class CreateWaitingPageComponent implements OnInit, OnDestroy {
    @Input() opponentName: string | undefined = undefined;
    isOpponentFound: boolean = false;
    waitingRoomMessage: string = HOST_WAITING_MESSAGE;
    roundTime: string = '1:00';
    currentLobby: LobbyInfo = DEFAULT_LOBBY;
    funFact: string = '';

    private isStartingGame: boolean = false;
    private componentDestroyed$: Subject<boolean> = new Subject();

    constructor(
        public dialog: MatDialog,
        public gameDispatcherService: GameDispatcherService,
        private readonly playerLeavesService: PlayerLeavesService,
        public router: Router,
        private snackBar: MatSnackBar,
    ) {}

    @HostListener('window:beforeunload')
    ngOnDestroy(): void {
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.complete();
        if (!this.isStartingGame) this.gameDispatcherService.handleCancelGame();
    }

    ngOnInit(): void {
        this.currentLobby = this.gameDispatcherService.currentLobby ?? DEFAULT_LOBBY;
        const roundTime: Timer = Timer.convertTime(this.currentLobby.maxRoundTime);
        this.roundTime = `${roundTime.minutes}:${roundTime.getTimerSecondsPadded()}`;
        this.funFact = getRandomFact();

        this.gameDispatcherService.subscribeToJoinRequestEvent(this.componentDestroyed$, (opponentName: string) => this.setOpponent(opponentName));
        this.playerLeavesService.subscribeToJoinerLeavesGameEvent(this.componentDestroyed$, (leaverName: string) => this.opponentLeft(leaverName));
        this.gameDispatcherService
            .observeGameCreationFailed()
            .pipe(takeUntil(this.componentDestroyed$))
            .subscribe((error: HttpErrorResponse) => this.handleGameCreationFail(error));
    }

    confirmConvertToSolo(): void {
        this.gameDispatcherService.handleCancelGame(KEEP_DATA);
        this.dialog
            .open(ConvertDialogComponent, {
                data: this.gameDispatcherService.currentLobby?.hostName,
            })
            .afterClosed()
            .subscribe((convertResult: ConvertResult) => (this.isStartingGame = convertResult.isConverting));
    }

    confirmOpponentToServer(): void {
        this.isStartingGame = true;
        if (this.opponentName) {
            this.gameDispatcherService.handleConfirmation(this.opponentName);
        }
    }

    confirmRejectionToServer(): void {
        if (this.opponentName) {
            this.gameDispatcherService.handleRejection(this.opponentName);
            this.disconnectOpponent();
        }
    }

    private setOpponent(opponentName: string): void {
        this.opponentName = opponentName;
        this.waitingRoomMessage = this.opponentName + OPPONENT_FOUND_MESSAGE;
        this.isOpponentFound = true;
    }

    private disconnectOpponent(): void {
        if (this.opponentName) {
            this.opponentName = undefined;
            this.waitingRoomMessage = HOST_WAITING_MESSAGE;
            this.isOpponentFound = false;
        }
    }

    private opponentLeft(leaverName: string): void {
        this.disconnectOpponent();
        this.dialog.open(DefaultDialogComponent, {
            data: {
                title: DIALOG_TITLE,
                content: leaverName + DIALOG_CONTENT,
                buttons: [
                    {
                        content: DIALOG_BUTTON_CONTENT_REJECTED,
                        closeDialog: true,
                    },
                ],
            },
        });
    }

    private handleGameCreationFail(error: HttpErrorResponse): void {
        this.confirmRejectionToServer();
        this.snackBar.open(error.error.message, 'Fermer', ERROR_SNACK_BAR_CONFIG);
        this.router.navigateByUrl('game-creation');
    }
}
