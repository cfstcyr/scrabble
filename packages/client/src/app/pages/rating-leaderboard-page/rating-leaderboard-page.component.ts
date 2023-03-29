import { Component } from '@angular/core';
import { UserService } from '@app/services/user-service/user.service';
import { RatedUser } from '@common/models/user';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-rating-leaderboard',
    templateUrl: './rating-leaderboard-page.component.html',
    styleUrls: ['./rating-leaderboard-page.component.scss'],
})
export class RatingLeaderboardPageComponent {
    results: Observable<RatedUser[]>;

    constructor(private readonly userService: UserService) {
        this.results = this.userService.requestRatingLeaderboard();
    }
}
