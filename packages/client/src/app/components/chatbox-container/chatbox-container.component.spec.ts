import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatboxContainerComponent } from './chatbox-container.component';

describe('ChatboxContainerComponent', () => {
    let component: ChatboxContainerComponent;
    let fixture: ComponentFixture<ChatboxContainerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ChatboxContainerComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ChatboxContainerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
