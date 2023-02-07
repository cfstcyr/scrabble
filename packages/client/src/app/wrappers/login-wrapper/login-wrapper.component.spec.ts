import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogginWrapperComponent } from './login-wrapper.component';

describe('LogginWrapperComponent', () => {
    let component: LogginWrapperComponent;
    let fixture: ComponentFixture<LogginWrapperComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [LogginWrapperComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LogginWrapperComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
