import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupWrapperComponent } from './signup-wrapper.component';

describe('SignupWrapperComponent', () => {
    let component: SignupWrapperComponent;
    let fixture: ComponentFixture<SignupWrapperComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SignupWrapperComponent],
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
