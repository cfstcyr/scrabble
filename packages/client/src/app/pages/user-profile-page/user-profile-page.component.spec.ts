// import { HttpClientTestingModule } from '@angular/common/http/testing';
// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { MatDialogModule } from '@angular/material/dialog';
// import { MatSnackBarModule } from '@angular/material/snack-bar';
// import { UserService } from '@app/services/user-service/user.service';

// import { UserProfilePageComponent } from './user-profile-page.component';

// describe('UserProfilePageComponent', () => {
//     let component: UserProfilePageComponent;
//     let fixture: ComponentFixture<UserProfilePageComponent>;
//     const userService = jasmine.createSpyObj(UserService, ['updateStatistics', 'updateGameHistory', 'updateServerActions']);

//     beforeEach(async () => {
//         await TestBed.configureTestingModule({
//             declarations: [UserProfilePageComponent],
//             imports: [HttpClientTestingModule, MatSnackBarModule, MatDialogModule],
//             providers: [{ provide: UserService, useValue: userService }],
//         }).compileComponents();
//     });

//     beforeEach(() => {
//         fixture = TestBed.createComponent(UserProfilePageComponent);
//         component = fixture.componentInstance;
//         fixture.detectChanges();
//     });

//     it('should create', () => {
//         expect(component).toBeTruthy();
//     });
// });
