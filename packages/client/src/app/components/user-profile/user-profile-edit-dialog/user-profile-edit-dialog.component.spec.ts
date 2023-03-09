// import { HttpClientTestingModule } from '@angular/common/http/testing';
// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { ReactiveFormsModule } from '@angular/forms';
// import { MatSnackBarModule } from '@angular/material/snack-bar';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { AlertService } from '@app/services/alert-service/alert.service';
// import { AuthenticationService } from '@app/services/authentication-service/authentication.service';
// import { UserService } from '@app/services/user-service/user.service';

// import { UserProfileEditDialogComponent } from './user-profile-edit-dialog.component';

// describe('UserProfileEditDialogComponent', () => {
//     let component: UserProfileEditDialogComponent;
//     let fixture: ComponentFixture<UserProfileEditDialogComponent>;

//     beforeEach(async () => {
//         const authenticationService = jasmine.createSpyObj(AuthenticationService, ['signup', 'validateEmail', 'validateUsername']);
//         await TestBed.configureTestingModule({
//             declarations: [UserProfileEditDialogComponent],
//             imports: [HttpClientTestingModule, MatSnackBarModule, ReactiveFormsModule, BrowserAnimationsModule],
//             providers: [{ provide: AuthenticationService, useValue: authenticationService }, AlertService, UserService],
//         }).compileComponents();
//     });

//     beforeEach(() => {
//         fixture = TestBed.createComponent(UserProfileEditDialogComponent);
//         component = fixture.componentInstance;
//         fixture.detectChanges();
//     });

//     it('should create', () => {
//         expect(component).toBeTruthy();
//     });
// });
