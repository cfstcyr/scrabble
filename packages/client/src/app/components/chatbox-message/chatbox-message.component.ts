import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { onlyHasEmoji } from '@app/utils/emoji/emoji';
import { emojify } from 'node-emoji';
import { ChatBoxComponent } from '@app/components/chatbox/chatbox.component';
import { PublicUser } from '@common/models/user';
import { UserService } from '@app/services/user-service/user.service';
import { ChatMessage } from '@common/models/chat/chat-message';
import { MINUTE } from '@app/constants/time-constant';

export interface DisplayMessage {
    sender: PublicUser;
    isCurrentUser: boolean;
    messages: ChatMessage[];
    date: Date;
    displayDate: boolean;
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

            current.content = emojify(current.content.trim());

            if (last) {
                const isRecent = current.date.getTime() - last.date.getTime() <= MINUTE;

                if (last.sender.username === current.sender.username && isRecent) {
                    last.messages.push(current);
                } else {
                    messages.push({
                        sender: current.sender,
                        isCurrentUser: this.userService.isUser(current.sender),
                        messages: [current],
                        date: current.date,
                        displayDate: !isRecent,
                    });
                }
                return messages;
            } else {
                return [
                    {
                        sender: current.sender,
                        isCurrentUser: this.userService.isUser(current.sender),
                        messages: [current],
                        date: current.date,
                        displayDate: true,
                    },
                ];
            }
        }, []);
    }

    getLastUsersAvatarUrl(): [string?, string?] {
        let avatars: [string?, string?] = [undefined, undefined];

        for (const {
            sender: { avatar },
        } of this.messages) {
            if (!avatars[0]) avatars = [avatar, undefined];
            if (!avatars[1] && avatars[0] !== avatar) return [avatars[0], avatar];
        }

        return avatars;
    }

    addMessage(content: string): void {
        this.messages.push({
            content,
            sender: this.userService.user,
            date: new Date(),
        });
        this.sendMessage.next(content);
    }

    onMessageSubmit(): void {
        if (!this.messageForm.valid) return;

        const content = this.messageForm.value.message.trim();

        if (content.length === 0) return;

        this.addMessage(content);
        this.messageForm.setValue({ message: '' });
    }

    onEmojiClick(emoji: string): void {
        this.addMessage(emoji);
    }
}
