import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DefaultDialogComponent } from '@app/components/default-dialog/default-dialog.component';
import { NO_GROUP_CAN_BE_JOINED } from '@app/constants/component-errors';
import {
    DIALOG_BUTTON_CONTENT_RETURN_GROUP,
    // DIALOG_CANCELED_CONTENT,
    // DIALOG_CANCELED_TITLE,
    DIALOG_FULL_CONTENT,
    DIALOG_FULL_TITLE,
} from '@app/constants/pages-constants';
import { GameDispatcherService } from '@app/services/';
import { gameSettings } from '@app/utils/settings';
import GroupInfo from '@common/models/group-info';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-group-page',
    templateUrl: './group-page.component.html',
    styleUrls: ['./group-page.component.scss'],
})
export class GroupPageComponent implements OnInit, OnDestroy {
    filterFormGroup: FormGroup;
    numberOfGroupsMeetingFilter: number;
    playerName: string;
    playerNameValid: boolean;
    groups: GroupInfo[];

    private componentDestroyed$: Subject<boolean>;

    constructor(public gameDispatcherService: GameDispatcherService, public dialog: MatDialog, private snackBar: MatSnackBar) {
        this.playerName = gameSettings.getPlayerName();
        this.playerNameValid = false;
        this.groups = [];
        this.componentDestroyed$ = new Subject();
        this.filterFormGroup = new FormGroup({
            gameType: new FormControl('all'),
        });
        this.numberOfGroupsMeetingFilter = 0;
    }

    ngOnInit(): void {
        this.gameDispatcherService.subscribeToGroupsUpdateEvent(this.componentDestroyed$, (groups: GroupInfo[]) => this.updateGroups(groups));
        this.gameDispatcherService.subscribeToGroupFullEvent(this.componentDestroyed$, () => this.groupFullDialog());
        // this.gameDispatcherService.subscribeToCanceledGameEvent(this.componentDestroyed$, () => this.groupCanceledDialog());
        this.gameDispatcherService.handleGroupListRequest();

        this.filterFormGroup.get('gameType')?.valueChanges.subscribe(() => this.updateAllGroupsAttributes());
    }

    ngOnDestroy(): void {
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.complete();
    }

    joinGroup(groupId: string): void {
        gameSettings.set('playerName', this.playerName);
        this.gameDispatcherService.handleJoinGroup(this.groups.filter((group) => group.groupId === groupId)[0], this.playerName);
    }

    joinRandomGroup(): void {
        try {
            const group = this.getRandomGroup();
            this.joinGroup(group.groupId);
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
        this.numberOfGroupsMeetingFilter = 0;
        this.setFormAvailability(this.playerNameValid);

        this.updateAllGroupsAttributes();
    }

    private setFormAvailability(isNameValid: boolean): void {
        if (isNameValid) {
            this.filterFormGroup.get('gameType')?.enable();
        } else {
            this.filterFormGroup.get('gameType')?.disable();
        }
    }

    private updateGroups(groups: GroupInfo[]): void {
        this.groups = groups;
        this.validateName();
    }

    private groupFullDialog(): void {
        this.dialog.open(DefaultDialogComponent, {
            data: {
                title: DIALOG_FULL_TITLE,
                content: DIALOG_FULL_CONTENT,
                buttons: [
                    {
                        content: DIALOG_BUTTON_CONTENT_RETURN_GROUP,
                        closeDialog: true,
                    },
                ],
            },
        });
    }

    // private groupCanceledDialog(): void {
    //     this.dialog.open(DefaultDialogComponent, {
    //         data: {
    //             title: DIALOG_CANCELED_TITLE,
    //             content: DIALOG_CANCELED_CONTENT,
    //             buttons: [
    //                 {
    //                     content: DIALOG_BUTTON_CONTENT_RETURN_GROUP,
    //                     closeDialog: true,
    //                 },
    //             ],
    //         },
    //     });
    // }

    private getRandomGroup(): GroupInfo {
        const filteredGroups = this.groups.filter((group) => group.canJoin);
        if (filteredGroups.length === 0) throw new Error(NO_GROUP_CAN_BE_JOINED);
        return filteredGroups[Math.floor(Math.random() * filteredGroups.length)];
    }

    private updateAllGroupsAttributes(): void {
        this.numberOfGroupsMeetingFilter = 0;
        for (const group of this.groups) {
            this.updateGroupAttributes(group);
            this.numberOfGroupsMeetingFilter++;
        }
    }

    private updateGroupAttributes(group: GroupInfo): void {
        group.canJoin = this.playerNameValid && this.playerName !== group.hostName;
    }
}
