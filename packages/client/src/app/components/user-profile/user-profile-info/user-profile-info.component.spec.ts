import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SrcsetPipe } from '@app/pipes/srcset/srcset.pipe';

import { UserProfileInfoComponent } from './user-profile-info.component';

describe('UserProfileInfoComponent', () => {
    let component: UserProfileInfoComponent;
    let fixture: ComponentFixture<UserProfileInfoComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [UserProfileInfoComponent, SrcsetPipe],
            imports: [MatSnackBarModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(UserProfileInfoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
