import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { UserService } from '@app/services/user-service/user.service';
import { GameHistoryForUser } from '@common/models/game-history';
import { PublicServerAction } from '@common/models/server-action';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-user-profile-page',
    templateUrl: './user-profile-page.component.html',
    styleUrls: ['./user-profile-page.component.scss'],
})
export class UserProfilePageComponent implements OnInit, AfterViewInit {
    @ViewChild('gameHistoryPaginator') gameHistoryPaginator: MatPaginator;
    @ViewChild('serverActionsPaginator') serverActionsPaginator: MatPaginator;

    gameHistoryColumns: string[] = ['startTime', 'endTime', 'gameResult', 'score'];
    serverActionsColumns: string[] = ['timestamp', 'actionType'];

    avatar: Observable<string | undefined>;
    username: Observable<string | undefined>;
    email: Observable<string | undefined>;
    gamesPlayedCount: Observable<number | undefined>;
    gamesWonCount: Observable<number | undefined>;
    averagePointsPerGame: Observable<number | undefined>;
    averageTimePerGame: Observable<number | undefined>;
    gameHistory: MatTableDataSource<GameHistoryForUser>;
    serverActions: MatTableDataSource<PublicServerAction>;

    constructor(private readonly userService: UserService) {
        this.avatar = this.userService.user.pipe(map((user) => user?.avatar));
        this.username = this.userService.user.pipe(map((user) => user?.username));
        this.email = this.userService.user.pipe(map((user) => user?.email));

        this.gamesPlayedCount = this.userService.statistics.pipe(map((userStatistics) => userStatistics?.gamesPlayedCount));
        this.gamesWonCount = this.userService.statistics.pipe(map((userStatistics) => userStatistics?.gamesWonCount));
        this.averagePointsPerGame = this.userService.statistics.pipe(map((userStatistics) => userStatistics?.averagePointsPerGame));
        this.averageTimePerGame = this.userService.statistics.pipe(map((userStatistics) => userStatistics?.averageTimePerGame));

        this.gameHistory = new MatTableDataSource<GameHistoryForUser>([]);
        this.serverActions = new MatTableDataSource<PublicServerAction>([]);

        this.userService.gameHistory.subscribe((gameHistory) => (this.gameHistory.data = gameHistory ?? []));
        this.userService.serverActions.subscribe((serverActions) => (this.serverActions.data = serverActions ?? []));
    }

    ngOnInit(): void {
        this.userService.updateStatistics();
        this.userService.updateGameHistory();
        this.userService.updateServerActions();
    }

    ngAfterViewInit(): void {
        this.gameHistory.paginator = this.gameHistoryPaginator;
        this.serverActions.paginator = this.serverActionsPaginator;
    }

    openEditUserDialog(): void {
        this.userService.openEditUserDialog();
    }
}