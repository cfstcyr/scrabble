import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { LoginContainerComponent } from '@app/components/login-container/login-container.component';

import { LoginWrapperComponent } from './login-wrapper.component';

describe('LoginWrapperComponent', () => {
    let component: LoginWrapperComponent;
    let fixture: ComponentFixture<LoginWrapperComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [LoginWrapperComponent, LoginContainerComponent],
            imports: [HttpClientTestingModule, MatSnackBarModule, RouterTestingModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LoginWrapperComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
