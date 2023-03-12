import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';

import { UserSearchResultPageComponent } from './user-search-result-page.component';

describe('UserSearchResultPageComponent', () => {
    let component: UserSearchResultPageComponent;
    let fixture: ComponentFixture<UserSearchResultPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [UserSearchResultPageComponent],
            imports: [HttpClientTestingModule, MatSnackBarModule, MatDialogModule, RouterTestingModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(UserSearchResultPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
