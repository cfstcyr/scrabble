import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Timer } from '@app/classes/round/timer';
import { ERROR_SNACK_BAR_CONFIG } from '@app/constants/components-constants';
import { getRandomFact } from '@app/constants/fun-facts-scrabble-constants';
import { DEFAULT_GROUP } from '@app/constants/pages-constants';
import { GameDispatcherService } from '@app/services/';
import { Group } from '@common/models/group';
import { PublicUser } from '@common/models/user';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-create-waiting-page',
    templateUrl: './create-waiting-page.component.html',
    styleUrls: ['./create-waiting-page.component.scss'],
})
export class CreateWaitingPageComponent implements OnInit, OnDestroy {
    requestingUsers: PublicUser[] = [];

    isGroupEmpty: boolean = true;
    isGroupFull: boolean = false;
    roundTime: string = '1:00';
    currentGroup: Group = DEFAULT_GROUP;
    funFact: string = '';

    private isStartingGame: boolean = false;
    private componentDestroyed$: Subject<boolean> = new Subject();

    constructor(
        public dialog: MatDialog,
        public gameDispatcherService: GameDispatcherService,
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
        this.currentGroup = this.gameDispatcherService.currentGroup ?? DEFAULT_GROUP;
        const roundTime: Timer = Timer.convertTime(this.currentGroup.maxRoundTime);
        this.roundTime = `${roundTime.minutes}:${roundTime.getTimerSecondsPadded()}`;
        this.funFact = getRandomFact();

        this.gameDispatcherService.subscribeToJoinRequestEvent(this.componentDestroyed$, (requestingUsers: PublicUser[]) =>
            this.updateRequestingUsers(requestingUsers),
        );
        this.gameDispatcherService.subscribeToPlayerCancelledRequestEvent(this.componentDestroyed$, (requestingUsers: PublicUser[]) =>
            this.updateRequestingUsers(requestingUsers),
        );
        this.gameDispatcherService.subscribeToPlayerLeftGroupEvent(this.componentDestroyed$, (group: Group) => this.updateGroup(group));
        this.gameDispatcherService.subscribeToPlayerJoinedGroupEvent(this.componentDestroyed$, (group: Group) => this.updateGroup(group));

        this.gameDispatcherService
            .observeGameCreationFailed()
            .pipe(takeUntil(this.componentDestroyed$))
            .subscribe((error: HttpErrorResponse) => this.handleGameCreationFail(error));
    }

    startGame(): void {
        this.isStartingGame = true;
        if (!this.isGroupEmpty) {
            this.gameDispatcherService.handleStart();
        }
    }
    updateGroup(group: Group) {
        this.currentGroup = group;
        this.updateGroupStatus();
    }

    updateRequestingUsers(requestingUsers: PublicUser[]) {
        this.requestingUsers = requestingUsers;
    }

    updateGroupStatus() {
        this.isGroupEmpty = this.currentGroup.user2 === undefined && this.currentGroup.user3 === undefined && this.currentGroup.user4 === undefined;
        this.isGroupFull = this.currentGroup.user2 !== undefined && this.currentGroup.user3 !== undefined && this.currentGroup.user4 !== undefined;
    }

    acceptUser(acceptedUser: PublicUser): void {
        if (this.isGroupFull) return;
        const requestingUsers = this.requestingUsers.filter((user) => user === acceptedUser);
        if (requestingUsers.length === 0) return;
        const requestingUser = requestingUsers[0];
        const index = this.requestingUsers.indexOf(requestingUser);
        this.requestingUsers.splice(index, 1);
        if (!this.currentGroup.user2) this.currentGroup.user2 = acceptedUser;
        else if (!this.currentGroup.user3) this.currentGroup.user3 = acceptedUser;
        else if (!this.currentGroup.user4) this.currentGroup.user4 = acceptedUser;
        this.updateGroupStatus();
        this.gameDispatcherService.handleConfirmation(acceptedUser.username);
    }

    rejectUser(rejectedUser: PublicUser): void {
        const requestingUsers = this.requestingUsers.filter((user) => user === rejectedUser);
        if (requestingUsers.length === 0) return;
        const requestingUser = requestingUsers[0];
        const index = requestingUsers.indexOf(requestingUser);
        this.requestingUsers.splice(index, 1);
        this.gameDispatcherService.handleRejection(rejectedUser.username);
    }

    private handleGameCreationFail(error: HttpErrorResponse): void {
        this.snackBar.open(error.error.message, 'Fermer', ERROR_SNACK_BAR_CONFIG);
        this.router.navigateByUrl('game-creation');
    }
}
