import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { UserService } from '@app/services/user-service/user.service';
import { GameHistoryForUser } from '@common/models/game-history';
import { PublicServerAction } from '@common/models/server-action';
import { PublicUser } from '@common/models/user';
import { PublicUserStatistics } from '@common/models/user-statistics';
import { BehaviorSubject } from 'rxjs';

import { UserProfilePageComponent } from './user-profile-page.component';

describe('UserProfilePageComponent', () => {
    let component: UserProfilePageComponent;
    let fixture: ComponentFixture<UserProfilePageComponent>;
    const userService = jasmine.createSpyObj(UserService, ['updateStatistics', 'updateGameHistory', 'updateServerActions']);
    userService.user = new BehaviorSubject<PublicUser>({ email: '1@2', avatar: '', username: 'John Doe' });
    userService.statistics = new BehaviorSubject<PublicUserStatistics>({
        gamesPlayedCount: 1,
        gamesWonCount: 1,
        averageTimePerGame: 1,
        averagePointsPerGame: 1,
    });
    userService.gameHistory = new BehaviorSubject<GameHistoryForUser[]>([]);
    userService.serverActions = new BehaviorSubject<PublicServerAction[]>([]);

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [UserProfilePageComponent],
            imports: [HttpClientTestingModule, MatSnackBarModule, MatDialogModule],
            providers: [{ provide: UserService, useValue: userService }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(UserProfilePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
