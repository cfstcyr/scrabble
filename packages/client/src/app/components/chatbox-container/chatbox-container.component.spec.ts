/* eslint-disable dot-notation */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { ClientChannel } from '@app/classes/chat/channel';
import { ChatboxMessageComponent } from '@app/components/chatbox-message/chatbox-message.component';
import { ChatBoxComponent } from '@app/components/chatbox/chatbox.component';
import { IconButtonComponent } from '@app/components/icon-button/icon-button.component';
import { IconComponent } from '@app/components/icon/icon.component';

import { ChatboxContainerComponent } from './chatbox-container.component';

const CHANNEL_1: ClientChannel = {
    id: '1',
    name: '1',
    messages: [],
    canQuit: true,
};
// const CHANNEL_2: ClientChannel = {
//     id: '2',
//     name: '2',
//     messages: [],
//     canQuit: true,
// };

describe('ChatboxContainerComponent', () => {
    let component: ChatboxContainerComponent;
    let fixture: ComponentFixture<ChatboxContainerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ReactiveFormsModule, MatDialogModule],
            providers: [FormBuilder],
            declarations: [ChatboxContainerComponent, ChatBoxComponent, ChatboxMessageComponent, IconComponent, IconButtonComponent],
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

    describe('ngOnDestroy', () => {
        it('should emit to componentDestroyed$', () => {
            spyOn(component['componentDestroyed$'], 'next');
            component.ngOnDestroy();
            expect(component['componentDestroyed$'].next).toHaveBeenCalled();
        });
    });

    // describe('getChannelsForStartChannel', () => {
    //     it('should return channels', () => {
    //         component.channels = [CHANNEL_1, CHANNEL_2];
    //         expect(component.getChannelsForMenu()).toHaveSize(component.channels.length);
    //     });
    // });

    describe('showChannel', () => {
        it('should add an open channel', () => {
            component.showChannel(CHANNEL_1);
            expect(component.openedChannels).toHaveSize(1);
        });
    });

    describe('minimizeChannel', () => {
        it('should add an open channel', () => {
            component.openedChannels = [CHANNEL_1];
            component.minimizeChannel(CHANNEL_1);
            expect(component.openedChannels).toHaveSize(0);
        });
    });

    describe('closeStartChannel', () => {
        it('should set startChannelIsOpen to false', () => {
            component.channelMenuIsOpen = true;
            component.closeMenu();
            expect(component.channelMenuIsOpen).toBeFalse();
        });
    });

    describe('toggleNewMessage', () => {
        it('should set startChannelIsOpen to false it true', () => {
            component.channelMenuIsOpen = true;
            component.toggleMenu();
            expect(component.channelMenuIsOpen).toBeFalse();
        });

        it('should set startChannelIsOpen to true it false', () => {
            component.channelMenuIsOpen = false;
            component.toggleMenu();
            expect(component.channelMenuIsOpen).toBeTrue();
        });
    });

    describe('handleSendMessage', () => {
        it('should emit to sendMessage', () => {
            spyOn(component.sendMessage, 'next');
            component.handleSendMessage(CHANNEL_1, '');
            expect(component.sendMessage.next).toHaveBeenCalled();
        });
    });

    describe('handleCreateChannel', () => {
        it('should emit to createChannel', () => {
            component.createChannelForm.setValue({ createChannel: 'abc' });
            spyOn(component.createChannel, 'next');
            component.handleCreateChannel();
            expect(component.createChannel.next).toHaveBeenCalled();
        });
    });

    describe('handleJoinChannel', () => {
        it('should emit to joinChannel', () => {
            component.joinChannelForm.setValue({ joinChannel: 'abc' });
            spyOn(component.joinChannel, 'next');
            component.handleJoinChannel();
            expect(component.joinChannel.next).toHaveBeenCalled();
        });
    });
});
