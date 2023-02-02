import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { onlyHasEmoji } from '@app/utils/emoji/emoji';
import { emojify } from 'node-emoji';
import { ChatBoxComponent } from '@app/components/chatbox/chatbox.component';

export interface Message {
    message: string;
    isCurrentUser: boolean;
    username: string;
}

export interface DisplayMessage {
    username: string;
    isCurrentUser: boolean;
    messages: string[];
}

@Component({
    selector: 'app-chatbox-message',
    templateUrl: './chatbox-message.component.html',
    styleUrls: ['./chatbox-message.component.scss'],
})
export class ChatboxMessageComponent extends ChatBoxComponent {
    @Input() messages: Message[];
    messageForm: FormGroup;
    onlyHasEmoji = onlyHasEmoji;

    constructor(private readonly formBuilder: FormBuilder) {
        super();
        this.messageForm = this.formBuilder.group({
            message: new FormControl('', [Validators.required]),
        });
    }

    getMessages(): DisplayMessage[] {
        return this.messages.reduce<DisplayMessage[]>((messages, current) => {
            const last = messages[messages.length - 1];

            if (last) {
                if (last.username === current.username) {
                    last.messages.push(emojify(current.message.trim()));
                } else {
                    messages.push({
                        username: current.username,
                        isCurrentUser: current.isCurrentUser,
                        messages: [emojify(current.message.trim())],
                    });
                }
                return messages;
            } else {
                return [
                    {
                        username: current.username,
                        isCurrentUser: current.isCurrentUser,
                        messages: [emojify(current.message.trim())],
                    },
                ];
            }
        }, []);
        // return [];
    }

    addMessage(message: Message): void {
        this.messages.push(message);
    }

    onMessageSubmit() {
        if (!this.messageForm.valid) return;

        const message = this.messageForm.value.message.trim();

        if (message.length === 0) return;

        this.addMessage({
            message,
            isCurrentUser: true,
            username: 'Me',
        });
        this.messageForm.setValue({ message: '' });
    }

    onEmojiClick(emoji: string) {
        this.addMessage({
            message: emoji,
            isCurrentUser: true,
            username: 'Me',
        });
    }
}
