import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { USER_NOT_FOUND } from '@app/constants/services-errors';
import { UserService } from '@app/services/user-service/user.service';
import { GameHistoryForUser } from '@common/models/game-history';
import { UserSearchResult } from '@common/models/user-search';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
    selector: 'app-user-search-result-page',
    templateUrl: './user-search-result-page.component.html',
    styleUrls: ['./user-search-result-page.component.scss'],
})
export class UserSearchResultPageComponent implements AfterViewInit {
    @ViewChild('gameHistoryPaginator') gameHistoryPaginator: MatPaginator;

    gameHistoryColumns: string[] = ['startTime', 'endTime', 'gameResult', 'score'];

    user$: Observable<UserSearchResult | undefined>;
    error$: Observable<string | undefined>;
    gameHistory: MatTableDataSource<GameHistoryForUser>;

    constructor(private readonly route: ActivatedRoute, private readonly userService: UserService) {
        this.user$ = this.userService.getUserByUsername(this.route.params.pipe(map((params) => params.username)));
        this.error$ = this.user$.pipe(
            map(() => undefined),
            catchError(() => of(USER_NOT_FOUND)),
        );

        this.gameHistory = new MatTableDataSource<GameHistoryForUser>([]);

        this.user$.subscribe((user) => {
            this.gameHistory.data = user?.gameHistory ?? [];
        });
    }

    ngAfterViewInit(): void {
        this.gameHistory.paginator = this.gameHistoryPaginator;
    }
}
