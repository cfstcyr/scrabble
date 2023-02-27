import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DefaultDialogComponent } from '@app/components/default-dialog/default-dialog.component';
import { GroupRequestWaitingDialogComponent } from '@app/components/group-request-waiting-dialog/group-request-waiting-dialog';
import { NO_GROUP_CAN_BE_JOINED } from '@app/constants/component-errors';
import { DIALOG_BUTTON_CONTENT_RETURN_GROUP, DIALOG_FULL_CONTENT, DIALOG_FULL_TITLE } from '@app/constants/pages-constants';
import { GameDispatcherService } from '@app/services/';
import { Group } from '@common/models/group';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-group-page',
    templateUrl: './group-page.component.html',
    styleUrls: ['./group-page.component.scss'],
})
export class GroupPageComponent implements OnInit, OnDestroy {
    numberOfGroups: number;
    groups: Group[];
    private componentDestroyed$: Subject<boolean>;

    constructor(public gameDispatcherService: GameDispatcherService, public dialog: MatDialog, private snackBar: MatSnackBar) {
        this.groups = [];
        this.componentDestroyed$ = new Subject();
        this.numberOfGroups = 0;
    }

    ngOnInit(): void {
        this.gameDispatcherService.subscribeToGroupsUpdateEvent(this.componentDestroyed$, (groups: Group[]) => this.updateGroups(groups));
        this.gameDispatcherService.subscribeToGroupFullEvent(this.componentDestroyed$, () => this.groupFullDialog());
        this.gameDispatcherService.handleGroupListRequest();
    }

    ngOnDestroy(): void {
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.complete();
    }

    joinGroup(groupId: string): void {
        const wantedGroup = this.groups.filter((group) => group.groupId === groupId)[0];
        // TODO: Change this whne we have multiple gamevisibilities
        // if (wantedGroup.gameVisibility === GameVisibility.Private) {
        this.groupRequestWaitingDialog(wantedGroup);
        // }
        this.gameDispatcherService.handleJoinGroup(wantedGroup);
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

    private updateGroups(groups: Group[]): void {
        this.groups = groups;
        this.numberOfGroups = this.groups.length;
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

    private groupRequestWaitingDialog(group: Group): void {
        const dialogRef = this.dialog.open(GroupRequestWaitingDialogComponent, {
            data: {
                group,
            },
        });

        dialogRef.afterClosed().subscribe(() => {
            this.gameDispatcherService.handleGroupListRequest();
        });
    }

    private getRandomGroup(): Group {
        const filteredGroups = this.groups.filter((group) => group);
        if (filteredGroups.length === 0) throw new Error(NO_GROUP_CAN_BE_JOINED);
        return filteredGroups[Math.floor(Math.random() * filteredGroups.length)];
    }
}
