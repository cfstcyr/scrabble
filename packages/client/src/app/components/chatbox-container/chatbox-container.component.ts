import { Component } from '@angular/core';
import { Message } from '@app/components/chatbox/chatbox.component';

interface Channel {
    title: string;
    messages: Message[];
}

@Component({
    selector: 'app-chatbox-container',
    templateUrl: './chatbox-container.component.html',
    styleUrls: ['./chatbox-container.component.scss'],
})
export class ChatboxContainerComponent {
    channels: Channel[];

    constructor() {
        this.channels = [
            {
                title: 'Général',
                messages: [],
            },
            {
                title: 'sup',
                messages: [],
            },
        ];
    }
}
