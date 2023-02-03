import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IconButtonComponent } from '@app/components/icon-button/icon-button.component';
import { IconComponent } from '@app/components/icon/icon.component';

import { ChatBoxComponent } from './chatbox.component';

describe('ChatboxComponent', () => {
    let component: ChatBoxComponent;
    let fixture: ComponentFixture<ChatBoxComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ChatBoxComponent, IconButtonComponent, IconComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ChatBoxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('handleMinimize', () => {
        it('should emit to onMinimize', () => {
            spyOn(component.onMinimize, 'next');
            component.handleMinimize();
            expect(component.onMinimize.next).toHaveBeenCalled();
        });
    });

    describe('handleClose', () => {
        it('should emit to onClose', () => {
            spyOn(component.onClose, 'next');
            component.handleClose();
            expect(component.onClose.next).toHaveBeenCalled();
        });
    });
});
