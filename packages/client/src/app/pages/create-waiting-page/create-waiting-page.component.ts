import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { PlayerData } from '@app/classes/communication';
import LobbyInfo from '@app/classes/communication/lobby-info';
import { Timer } from '@app/classes/round/timer';
import { ConvertDialogComponent, ConvertResult } from '@app/components/convert-dialog/convert-dialog.component';
import { ERROR_SNACK_BAR_CONFIG } from '@app/constants/components-constants';
import { getRandomFact } from '@app/constants/fun-facts-scrabble-constants';
import { DEFAULT_LOBBY, HOST_WAITING_MESSAGE, KEEP_DATA, OPPONENT_FOUND_MESSAGE } from '@app/constants/pages-constants';
import { GameDispatcherService } from '@app/services/';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-create-waiting-page',
    templateUrl: './create-waiting-page.component.html',
    styleUrls: ['./create-waiting-page.component.scss'],
})
export class CreateWaitingPageComponent implements OnInit, OnDestroy {
    @Input() opponentName: string | undefined = undefined;
    @Input() opponentName1: string | undefined = undefined;
    @Input() opponentName2: string | undefined = undefined;
    @Input() opponentName3: string | undefined = undefined;
    requestingPlayers: string[] = [];

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
        // private readonly playerLeavesService: PlayerLeavesService,
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
        // this.gameDispatcherService.subscribeToPlayerJoinedGroupEvent(this.componentDestroyed$, (player: PlayerData) =>
        //     this.setOpponent(player.name ?? ''),
        // );

        this.gameDispatcherService.subscribeToPlayerLeftGroupEvent(this.componentDestroyed$, (players: PlayerData[]) =>
            this.setAcceptedOpponents(players),
        );

        // this.playerLeavesService.subscribeToJoinerLeavesGameEvent(this.componentDestroyed$, (leaverName: string) => this.opponentLeft(leaverName));
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

    startGame(): void {
        this.isStartingGame = true;
        if (this.opponentName) {
            this.gameDispatcherService.handleStart();
        }
    }

    confirmOpponentToServer2(name: string): void {
        if (!this.opponentName1) this.opponentName1 = name;
        else if (!this.opponentName2) this.opponentName2 = name;
        else if (!this.opponentName3) this.opponentName3 = name;
        const requestingPlayers = this.requestingPlayers.filter((playerName) => name === playerName);
        const requestingPlayer = requestingPlayers[0];
        const index = this.requestingPlayers.indexOf(requestingPlayer);
        this.requestingPlayers.splice(index, 1);
        this.gameDispatcherService.handleConfirmation(name);
    }

    confirmRejectionToServer2(name: string): void {
        const requestingPlayers = this.requestingPlayers.filter((playerName) => name === playerName);
        const requestingPlayer = requestingPlayers[0];
        const index = requestingPlayers.indexOf(requestingPlayer);
        this.requestingPlayers.splice(index, 1);
        this.disconnectOpponent();
        this.gameDispatcherService.handleRejection(name);
    }

    confirmRejectionToServer(): void {
        if (this.opponentName) {
            this.gameDispatcherService.handleRejection(this.opponentName);
            this.disconnectOpponent();
        }
    }

    private setOpponent(opponentName: string): void {
        this.requestingPlayers.push(opponentName);
        this.opponentName = opponentName;
        this.waitingRoomMessage = this.opponentName + OPPONENT_FOUND_MESSAGE;
        this.isOpponentFound = true;
    }

    private setAcceptedOpponents(players: PlayerData[]) {
        this.opponentName1 = undefined;
        this.opponentName2 = undefined;
        this.opponentName3 = undefined;
        for (const player of players) {
            if (this.currentLobby.hostName !== player.name) {
                if (!this.opponentName1) {
                    this.opponentName1 = player.name;
                } else if (!this.opponentName2) {
                    this.opponentName2 = player.name;
                } else if (!this.opponentName3) {
                    this.opponentName3 = player.name;
                }
            }
        }
    }

    private disconnectOpponent(): void {
        if (this.opponentName) {
            this.opponentName = undefined;
            this.waitingRoomMessage = HOST_WAITING_MESSAGE;
            this.isOpponentFound = false;
        }
    }

    // private opponentLeft(leaverName: string): void {
    //     this.disconnectOpponent();
    //     this.dialog.open(DefaultDialogComponent, {
    //         data: {
    //             title: DIALOG_TITLE,
    //             content: leaverName + DIALOG_CONTENT,
    //             buttons: [
    //                 {
    //                     content: DIALOG_BUTTON_CONTENT_REJECTED,
    //                     closeDialog: true,
    //                 },
    //             ],
    //         },
    //     });
    // }

    private handleGameCreationFail(error: HttpErrorResponse): void {
        this.confirmRejectionToServer();
        this.snackBar.open(error.error.message, 'Fermer', ERROR_SNACK_BAR_CONFIG);
        this.router.navigateByUrl('game-creation');
    }
}
