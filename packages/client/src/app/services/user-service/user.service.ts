import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UserProfileEditDialogComponent } from '@app/components/user-profile/user-profile-edit-dialog/user-profile-edit-dialog.component';
import { LOGIN_REQUIRED } from '@app/constants/services-errors';
import { UserController } from '@app/controllers/user-controller/user.controller';
import { GameHistoryForUser } from '@common/models/game-history';
import { PublicServerAction } from '@common/models/server-action';
import { EditableUserFields, PublicUser } from '@common/models/user';
import { PublicUserStatistics } from '@common/models/user-statistics';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AlertService } from '@app/services/alert-service/alert.service';

@Injectable({
    providedIn: 'root',
})
export class UserService {
    user: BehaviorSubject<PublicUser | undefined>;
    statistics: BehaviorSubject<PublicUserStatistics | undefined>;
    gameHistory: BehaviorSubject<GameHistoryForUser[] | undefined>;
    serverActions: BehaviorSubject<PublicServerAction[] | undefined>;

    constructor(private readonly userController: UserController, private readonly alertService: AlertService, private readonly dialog: MatDialog) {
        this.user = new BehaviorSubject<PublicUser | undefined>(undefined);
        this.statistics = new BehaviorSubject<PublicUserStatistics | undefined>(undefined);
        this.gameHistory = new BehaviorSubject<GameHistoryForUser[] | undefined>(undefined);
        this.serverActions = new BehaviorSubject<PublicServerAction[] | undefined>(undefined);
    }

    isConnected(): Observable<boolean> {
        return this.user.pipe(map((user) => Boolean(user)));
    }

    getUser(): PublicUser {
        if (!this.user.value) throw new Error(LOGIN_REQUIRED);
        return this.user.value;
    }

    isUser(u: PublicUser | string) {
        return (typeof u === 'string' ? u : u.username) === this.user.value?.username;
    }

    editUser(edits: EditableUserFields): Observable<PublicUser> {
        return this.userController.editUser(edits).pipe(tap((user) => this.user.next(user)));
    }

    updateStatistics(): void {
        this.userController.getUserStatistics().subscribe((userStatistics) => this.statistics.next(userStatistics));
    }

    updateGameHistory(): void {
        this.userController
            .getGameHistory()
            .pipe(
                tap((gameHistory) => {
                    gameHistory.forEach((history) => {
                        history.startTime = new Date(history.startTime);
                        history.endTime = new Date(history.endTime);
                    });
                }),
            )
            .subscribe((gameHistory) => this.gameHistory.next(gameHistory));
    }

    updateServerActions(): void {
        this.userController.getServerActions().subscribe((serverActions) => this.serverActions.next(serverActions));
    }

    openEditUserDialog(): Observable<boolean> {
        const subject = new Subject<boolean>();

        const initialValues: EditableUserFields = {
            username: this.getUser().username,
            avatar: this.getUser().avatar,
        };
        const dialogRef = this.dialog.open(UserProfileEditDialogComponent, { data: initialValues });

        dialogRef.afterClosed().subscribe(async (edits: EditableUserFields | undefined) => {
            if (edits) {
                try {
                    await this.editUser(edits).toPromise();
                    this.alertService.success('Modifications enregistrées');
                } catch {
                    this.alertService.error("Impossible d'appliquer les modifications");
                }
            }
            subject.next(edits !== undefined);
            subject.complete();
        });

        return subject.asObservable();
    }
}
