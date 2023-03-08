import { Injectable } from '@angular/core';
import { LOGIN_REQUIRED } from '@app/constants/services-errors';
import { UserController } from '@app/controllers/user-controller/user.controller';
import { GameHistoryForUser } from '@common/models/game-history';
import { PublicServerAction } from '@common/models/server-action';
import { PublicUser } from '@common/models/user';
import { PublicUserStatistics } from '@common/models/user-statistics';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class UserService {
    user: BehaviorSubject<PublicUser | undefined>;
    statistics: BehaviorSubject<PublicUserStatistics | undefined>;
    gameHistory: BehaviorSubject<GameHistoryForUser[] | undefined>;
    serverActions: BehaviorSubject<PublicServerAction[] | undefined>;

    constructor(private readonly userController: UserController) {
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
}
