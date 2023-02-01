import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { onlyHasEmoji } from '@app/utils/emoji/emoji';
import { emojify } from 'node-emoji';

export interface Message {
    message: string;
    isCurrentUser: boolean;
}

@Component({
    selector: 'app-chatbox',
    templateUrl: './chatbox.component.html',
    styleUrls: ['./chatbox.component.scss'],
})
export class ChatBoxComponent {
    @Input() title: string;
    @Input() messages: Message[];
    @Input() isOpen = true;
    messageForm: FormGroup;
    onlyHasEmoji = onlyHasEmoji;
    emojify = emojify;

    constructor(private readonly formBuilder: FormBuilder) {
        this.messageForm = this.formBuilder.group({
            message: new FormControl('', [Validators.required]),
        });
    }

    toggleOpen() {
        this.isOpen = !this.isOpen;
    }

    addMessage(message: Message): void {
        this.messages.push(message);
    }

    onMessageSubmit() {
        if (!this.messageForm.valid) return;
        this.addMessage({
            message: this.messageForm.value.message,
            isCurrentUser: true,
        });
        this.messageForm.setValue({ message: '' });
    }

    onEmojiClick(emoji: string) {
        this.addMessage({
            message: emoji,
            isCurrentUser: true,
        });
    }
}
