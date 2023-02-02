import { Component, Input } from '@angular/core';
import { Message } from '@app/components/chatbox-message/chatbox-message.component';

interface Channel {
    id: string;
    title: string;
    messages: Message[];
    hidden: boolean;
}

@Component({
    selector: 'app-chatbox-container',
    templateUrl: './chatbox-container.component.html',
    styleUrls: ['./chatbox-container.component.scss'],
})
export class ChatboxContainerComponent {
    @Input() channels: Channel[];

    constructor() {
        this.channels = [
            {
                id: '1',
                title: 'Général',
                messages: [],
                hidden: false,
            },
            {
                id: '2',
                title: 'sup',
                messages: [],
                hidden: true,
            },
        ];
    }

    showChannel(channel: Channel) {
        channel.hidden = false;
    }

    minimizeChannel(channel: Channel) {
        channel.hidden = true;
    }

    closeChannel(channel: Channel) {
        if (confirm(`Do you want to quit channel "${channel.title}"?`)) {
            this.channels = this.channels.filter(({ id }) => id !== channel.id);
        }
    }
}
