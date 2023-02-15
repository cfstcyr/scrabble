import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { SignupContainerComponent } from '@app/components/signup-container/signup-container.component';

import { SignupWrapperComponent } from './signup-wrapper.component';

describe('SignupWrapperComponent', () => {
    let component: SignupWrapperComponent;
    let fixture: ComponentFixture<SignupWrapperComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SignupWrapperComponent, SignupContainerComponent],
            imports: [HttpClientTestingModule, RouterTestingModule, MatSnackBarModule, MatMenuModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SignupWrapperComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
