import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserService } from '@app/services/user-service/user.service';

import { UserProfilePageComponent } from './user-profile-page.component';

describe('UserProfilePageComponent', () => {
    let component: UserProfilePageComponent;
    let fixture: ComponentFixture<UserProfilePageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [UserProfilePageComponent],
            providers: [UserService],
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
