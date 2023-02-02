import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatboxWrapperComponent } from './chatbox-wrapper.component';

describe('ChatboxWrapperComponent', () => {
    let component: ChatboxWrapperComponent;
    let fixture: ComponentFixture<ChatboxWrapperComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ChatboxWrapperComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ChatboxWrapperComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
