import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { onlyHasEmoji } from '@app/utils/emoji/emoji';
import { emojify } from 'node-emoji';
import { ChatBoxComponent } from '@app/components/chatbox/chatbox.component';
import { PublicUser } from '@common/models/user';
import { UserService } from '@app/services/user-service/user.service';
import { ChatMessage } from '@common/models/chat/chat-message';

export interface DisplayMessage {
    sender: PublicUser;
    isCurrentUser: boolean;
    messages: string[];
}

@Component({
    selector: 'app-chatbox-message',
    templateUrl: './chatbox-message.component.html',
    styleUrls: ['./chatbox-message.component.scss'],
})
export class ChatboxMessageComponent extends ChatBoxComponent {
    @Input() messages: ChatMessage[] = [];
    @Output() sendMessage: EventEmitter<string> = new EventEmitter();
    messageForm: FormGroup;
    onlyHasEmoji = onlyHasEmoji;

    constructor(private readonly formBuilder: FormBuilder, private readonly userService: UserService) {
        super();
        this.messageForm = this.formBuilder.group({
            message: new FormControl('', [Validators.required]),
        });
    }

    getMessages(): DisplayMessage[] {
        return this.messages.reduce<DisplayMessage[]>((messages, current) => {
            const last = messages[messages.length - 1];

            const content = emojify(current.content.trim());

            if (last) {
                if (last.sender.username === current.sender.username) {
                    last.messages.push(content);
                } else {
                    messages.push({
                        sender: current.sender,
                        isCurrentUser: this.userService.isUser(current.sender),
                        messages: [content],
                    });
                }
                return messages;
            } else {
                return [
                    {
                        sender: current.sender,
                        isCurrentUser: this.userService.isUser(current.sender),
                        messages: [content],
                    },
                ];
            }
        }, []);
    }

    getLastUsersAvatarUrl(): [string?, string?] {
        return this.messages.reduce<[string?, string?]>(
            (avatars, { sender: { avatar } }) => {
                if (!avatars[0]) return [avatar, undefined];
                if (!avatars[1] && avatars[0] !== avatar) return [avatars[0], avatar];

                return avatars;
            },
            [undefined, undefined],
        );
    }

    addMessage(content: string): void {
        this.messages.push({
            content,
            sender: this.userService.user,
        });
        this.sendMessage.next(content);
    }

    onMessageSubmit() {
        if (!this.messageForm.valid) return;

        const content = this.messageForm.value.message.trim();

        if (content.length === 0) return;

        this.addMessage(content);
        this.messageForm.setValue({ message: '' });
    }

    onEmojiClick(emoji: string) {
        this.addMessage(emoji);
    }
}
