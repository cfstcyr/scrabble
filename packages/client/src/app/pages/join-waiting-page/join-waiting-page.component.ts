import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NavigationStart, Router } from '@angular/router';
import { PlayerData } from '@app/classes/communication';
import { Timer } from '@app/classes/round/timer';
import { DefaultDialogComponent } from '@app/components/default-dialog/default-dialog.component';
import { getRandomFact } from '@app/constants/fun-facts-scrabble-constants';
import {
    DEFAULT_GROUP,
    DIALOG_BUTTON_CONTENT_REJECTED,
    DIALOG_BUTTON_CONTENT_RETURN_GROUP,
    DIALOG_CANCEL_CONTENT,
    DIALOG_CANCEL_TITLE,
    DIALOG_REJECT_CONTENT,
    DIALOG_REJECT_TITLE,
} from '@app/constants/pages-constants';
import GameDispatcherService from '@app/services/game-dispatcher-service/game-dispatcher.service';
import { PlayerLeavesService } from '@app/services/player-leave-service/player-leave.service';
import GroupInfo from '@common/models/group-info';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-waiting-page',
    templateUrl: './join-waiting-page.component.html',
    styleUrls: ['./join-waiting-page.component.scss'],
})
export class JoinWaitingPageComponent implements OnInit, OnDestroy {
    currentGroup: GroupInfo;
    currentName: string;
    funFact: string;
    roundTime: string;
    opponents: string[] = [];

    private componentDestroyed$: Subject<boolean>;

    constructor(
        public dialog: MatDialog,
        public gameDispatcherService: GameDispatcherService,
        private readonly playerLeavesService: PlayerLeavesService,
        public router: Router,
    ) {
        this.componentDestroyed$ = new Subject();
    }

    @HostListener('window:beforeunload')
    onBeforeUnload(): void {
        this.playerLeavesService.handleLeaveGroup();
    }

    ngOnInit(): void {
        this.currentGroup = this.gameDispatcherService.currentGroup ?? DEFAULT_GROUP;
        const roundTime: Timer = Timer.convertTime(this.currentGroup.maxRoundTime);
        this.roundTime = `${roundTime.minutes}:${roundTime.getTimerSecondsPadded()}`;

        this.currentName = this.gameDispatcherService.currentName;
        this.funFact = getRandomFact();

        this.router.events.pipe(takeUntil(this.componentDestroyed$)).subscribe((event) => {
            if (event instanceof NavigationStart) {
                this.routerChangeMethod(event.url);
            }
        });

        this.gameDispatcherService.subscribeToPlayerJoinedGroupEvent(this.componentDestroyed$, (players: PlayerData[]) => this.setOpponents(players));
        this.gameDispatcherService.subscribeToPlayerLeftGroupEvent(this.componentDestroyed$, (players: PlayerData[]) => this.setOpponents(players));

        this.gameDispatcherService.subscribeToCanceledGameEvent(this.componentDestroyed$, (hostName: string) => this.hostHasCanceled(hostName));
        this.gameDispatcherService.subscribeToJoinerRejectedEvent(this.componentDestroyed$, (hostName: string) => this.playerRejected(hostName));
    }

    ngOnDestroy(): void {
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.complete();
    }

    private setOpponents(players: PlayerData[]) {
        this.opponents = [];
        for (const player of players) {
            if (this.currentName !== player.name && player.name) {
                this.opponents.push(player.name);
            }
        }
    }

    private routerChangeMethod(url: string): void {
        if (url !== '/game') {
            this.playerLeavesService.handleLeaveGroup();
        }
    }

    private playerRejected(hostName: string): void {
        this.dialog.open(DefaultDialogComponent, {
            data: {
                title: DIALOG_REJECT_TITLE,
                content: hostName + DIALOG_REJECT_CONTENT,
                buttons: [
                    {
                        content: DIALOG_BUTTON_CONTENT_REJECTED,
                        redirect: '/group',
                        closeDialog: true,
                    },
                ],
            },
        });
    }

    private hostHasCanceled(hostName: string): void {
        this.dialog.open(DefaultDialogComponent, {
            data: {
                title: DIALOG_CANCEL_TITLE,
                content: hostName + DIALOG_CANCEL_CONTENT,
                buttons: [
                    {
                        content: DIALOG_BUTTON_CONTENT_RETURN_GROUP,
                        redirect: '/group',
                        closeDialog: true,
                    },
                ],
            },
        });
    }
}
