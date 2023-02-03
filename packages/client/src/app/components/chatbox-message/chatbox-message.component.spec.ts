import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ChatBoxComponent } from '@app/components/chatbox/chatbox.component';
import { IconButtonComponent } from '@app/components/icon-button/icon-button.component';
import { IconComponent } from '@app/components/icon/icon.component';
import { UserService } from '@app/services/user-service/user.service';
import { PublicUser } from '@common/models/user';
import { ChatboxMessageComponent } from './chatbox-message.component';

const USER_1: PublicUser = {
    username: '1',
    avatar: '1',
};
const USER_2: PublicUser = {
    username: '2',
    avatar: '2',
};

describe('ChatboxMessageComponent', () => {
    let component: ChatboxMessageComponent;
    let fixture: ComponentFixture<ChatboxMessageComponent>;
    let userService: jasmine.SpyObj<UserService>;

    beforeEach(async () => {
        userService = jasmine.createSpyObj('UserService', ['isUser']);

        await TestBed.configureTestingModule({
            imports: [ReactiveFormsModule],
            providers: [FormBuilder, { provide: UserService, useValue: userService }],
            declarations: [ChatboxMessageComponent, ChatBoxComponent, IconComponent, IconButtonComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ChatboxMessageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('getMessages', () => {
        it('should return empty array if no messages', () => {
            expect(component.getMessages()).toHaveSize(0);
        });

        it('should group messages', () => {
            component.messages = [
                {
                    content: '',
                    sender: USER_1,
                },
                {
                    content: '',
                    sender: USER_1,
                },
                {
                    content: '',
                    sender: USER_2,
                },
            ];
            expect(component.getMessages()).toHaveSize(2);
        });
    });

    describe('getLastUsersAvatarUrl', () => {
        it('should return undefined of no messages', () => {
            const [a1, a2] = component.getLastUsersAvatarUrl();
            expect(a1).toBeUndefined();
            expect(a2).toBeUndefined();
        });

        it('should return 1 avatar if 1 unique', () => {
            component.messages = [
                {
                    content: '',
                    sender: USER_1,
                },
                {
                    content: '',
                    sender: USER_1,
                },
            ];
            const [a1, a2] = component.getLastUsersAvatarUrl();
            expect(a1).toEqual(USER_1.avatar);
            expect(a2).toBeUndefined();
        });

        it('should return avatars', () => {
            component.messages = [
                {
                    content: '',
                    sender: USER_1,
                },
                {
                    content: '',
                    sender: USER_1,
                },
                {
                    content: '',
                    sender: USER_2,
                },
            ];
            const [a1, a2] = component.getLastUsersAvatarUrl();
            expect(a1).toEqual(USER_1.avatar);
            expect(a2).toEqual(USER_2.avatar);
        });
    });

    describe('addMessage', () => {
        it('should add message', () => {
            component.addMessage('');
            expect(component.messages).toHaveSize(1);
        });

        it('should emit sendMessage', () => {
            spyOn(component.sendMessage, 'next');
            component.addMessage('');
            expect(component.sendMessage.next).toHaveBeenCalled();
        });
    });

    describe('onMessageSubmit', () => {
        it('should call addMessage', () => {
            spyOn(component, 'addMessage');
            component.messageForm.setValue({ message: 'abc' });
            component.onMessageSubmit();
            expect(component.addMessage).toHaveBeenCalled();
        });
    });

    describe('onEmojiClick', () => {
        it('should call addMessage', () => {
            spyOn(component, 'addMessage');
            component.onEmojiClick('🐸');
            expect(component.addMessage).toHaveBeenCalled();
        });
    });
});
