import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LobbyInfo } from '@app/classes/communication/';
import { DefaultDialogComponent } from '@app/components/default-dialog/default-dialog.component';
import { NO_LOBBY_CAN_BE_JOINED } from '@app/constants/component-errors';
import {
    DIALOG_BUTTON_CONTENT_RETURN_LOBBY,
    // DIALOG_CANCELED_CONTENT,
    // DIALOG_CANCELED_TITLE,
    DIALOG_FULL_CONTENT,
    DIALOG_FULL_TITLE,
} from '@app/constants/pages-constants';
import { GameDispatcherService } from '@app/services/';
import { gameSettings } from '@app/utils/settings';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-lobby-page',
    templateUrl: './lobby-page.component.html',
    styleUrls: ['./lobby-page.component.scss'],
})
export class LobbyPageComponent implements OnInit, OnDestroy {
    filterFormGroup: FormGroup;
    numberOfLobbiesMeetingFilter: number;
    playerName: string;
    playerNameValid: boolean;
    lobbies: LobbyInfo[];

    private componentDestroyed$: Subject<boolean>;

    constructor(public gameDispatcherService: GameDispatcherService, public dialog: MatDialog, private snackBar: MatSnackBar) {
        this.playerName = gameSettings.getPlayerName();
        this.playerNameValid = false;
        this.lobbies = [];
        this.componentDestroyed$ = new Subject();
        this.filterFormGroup = new FormGroup({
            gameType: new FormControl('all'),
        });
        this.numberOfLobbiesMeetingFilter = 0;
    }

    ngOnInit(): void {
        this.gameDispatcherService.subscribeToLobbiesUpdateEvent(this.componentDestroyed$, (lobbies: LobbyInfo[]) => this.updateLobbies(lobbies));
        this.gameDispatcherService.subscribeToLobbyFullEvent(this.componentDestroyed$, () => this.lobbyFullDialog());
        // this.gameDispatcherService.subscribeToCanceledGameEvent(this.componentDestroyed$, () => this.lobbyCanceledDialog());
        this.gameDispatcherService.handleLobbyListRequest();

        this.filterFormGroup.get('gameType')?.valueChanges.subscribe(() => this.updateAllLobbiesAttributes());
    }

    ngOnDestroy(): void {
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.complete();
    }

    joinLobby(lobbyId: string): void {
        gameSettings.set('playerName', this.playerName);
        this.gameDispatcherService.handleJoinLobby(this.lobbies.filter((lobby) => lobby.lobbyId === lobbyId)[0], this.playerName);
    }

    joinRandomLobby(): void {
        try {
            const lobby = this.getRandomLobby();
            this.joinLobby(lobby.lobbyId);
        } catch (exception) {
            this.snackBar.open((exception as Error).toString(), 'Ok', {
                duration: 3000,
            });
        }
    }

    onPlayerNameChanges([playerName, valid]: [string, boolean]): void {
        setTimeout(() => {
            this.playerName = playerName;
            this.playerNameValid = valid;
            this.validateName();
        });
    }

    private validateName(): void {
        this.numberOfLobbiesMeetingFilter = 0;
        this.setFormAvailability(this.playerNameValid);

        this.updateAllLobbiesAttributes();
    }

    private setFormAvailability(isNameValid: boolean): void {
        if (isNameValid) {
            this.filterFormGroup.get('gameType')?.enable();
        } else {
            this.filterFormGroup.get('gameType')?.disable();
        }
    }

    private updateLobbies(lobbies: LobbyInfo[]): void {
        this.lobbies = lobbies;
        this.validateName();
    }

    private lobbyFullDialog(): void {
        this.dialog.open(DefaultDialogComponent, {
            data: {
                title: DIALOG_FULL_TITLE,
                content: DIALOG_FULL_CONTENT,
                buttons: [
                    {
                        content: DIALOG_BUTTON_CONTENT_RETURN_LOBBY,
                        closeDialog: true,
                    },
                ],
            },
        });
    }

    // private lobbyCanceledDialog(): void {
    //     this.dialog.open(DefaultDialogComponent, {
    //         data: {
    //             title: DIALOG_CANCELED_TITLE,
    //             content: DIALOG_CANCELED_CONTENT,
    //             buttons: [
    //                 {
    //                     content: DIALOG_BUTTON_CONTENT_RETURN_LOBBY,
    //                     closeDialog: true,
    //                 },
    //             ],
    //         },
    //     });
    // }

    private getRandomLobby(): LobbyInfo {
        const filteredLobbies = this.lobbies.filter((lobby) => lobby.canJoin && lobby.meetFilters);
        if (filteredLobbies.length === 0) throw new Error(NO_LOBBY_CAN_BE_JOINED);
        return filteredLobbies[Math.floor(Math.random() * filteredLobbies.length)];
    }

    private updateAllLobbiesAttributes(): void {
        this.numberOfLobbiesMeetingFilter = 0;
        for (const lobby of this.lobbies) {
            this.updateLobbyAttributes(lobby);
            if (lobby.meetFilters) this.numberOfLobbiesMeetingFilter++;
        }
    }

    private updateLobbyAttributes(lobby: LobbyInfo): void {
        const gameType = this.filterFormGroup.get('gameType')?.value;
        lobby.meetFilters = gameType === 'all' || gameType === lobby.gameType;
        lobby.canJoin = this.playerNameValid && this.playerName !== lobby.hostName;
    }
}
