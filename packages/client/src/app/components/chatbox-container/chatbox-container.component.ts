import { Component, Input } from '@angular/core';
import { Message } from '@app/components/chatbox-message/chatbox-message.component';

interface Channel {
    id: string;
    title: string;
    messages: Message[];
}

@Component({
    selector: 'app-chatbox-container',
    templateUrl: './chatbox-container.component.html',
    styleUrls: ['./chatbox-container.component.scss'],
})
export class ChatboxContainerComponent {
    @Input() channels: Channel[];
    openedChannels: Channel[];
    newMessageIsOpen: boolean = false;

    constructor() {
        this.channels = [
            {
                id: '1',
                title: 'Général',
                messages: [],
            },
            {
                id: '2',
                title: 'sup',
                messages: [],
            },
        ];
        this.openedChannels = [];
    }

    getChannelsForNewMessage(): (Channel & { canOpen: boolean })[] {
        return this.channels.map<Channel & { canOpen: boolean }>((channel) => ({
            ...channel,
            canOpen: !this.openedChannels.find((c) => channel.id === c.id),
        }));
    }

    showChannel(channel: Channel) {
        this.openedChannels.push(channel);
        this.closeNewMessage();
    }

    minimizeChannel(channel: Channel) {
        const index = this.openedChannels.findIndex(({ id }) => channel.id === id);
        this.openedChannels.splice(index, 1);
    }

    closeChannel(channel: Channel) {
        if (confirm(`Do you want to quit channel "${channel.title}"?`)) {
            this.minimizeChannel(channel);
            this.channels = this.channels.filter(({ id }) => id !== channel.id);
        }
    }

    closeNewMessage() {
        this.newMessageIsOpen = false;
    }

    toggleNewMessage() {
        this.newMessageIsOpen = !this.newMessageIsOpen;
    }
}
