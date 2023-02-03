import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatService } from '@app/services/chat-service/chat.service';
import { Subject } from 'rxjs';

import { ChatboxWrapperComponent } from './chatbox-wrapper.component';

describe('ChatboxWrapperComponent', () => {
    let component: ChatboxWrapperComponent;
    let fixture: ComponentFixture<ChatboxWrapperComponent>;
    let chatService: jasmine.SpyObj<ChatService>;

    beforeEach(async () => {
        chatService = jasmine.createSpyObj('ChatService', ['configureSocket', 'sendMessage', 'createChannel', 'joinChannel'], {
            channels: [],
            joinedChannel: new Subject<void>(),
        });

        await TestBed.configureTestingModule({
            declarations: [ChatboxWrapperComponent],
            providers: [{ provide: ChatService, useValue: chatService }],
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
