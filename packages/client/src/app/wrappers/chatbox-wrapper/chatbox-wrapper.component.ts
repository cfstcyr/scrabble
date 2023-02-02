import { Component } from '@angular/core';
import { ClientChannel } from '@app/classes/chat/channel';
import { ChatService } from '@app/services/chat-service/chat.service';
import { Channel } from '@common/models/chat/channel';

@Component({
    selector: 'app-chatbox-wrapper',
    templateUrl: './chatbox-wrapper.component.html',
    styleUrls: ['./chatbox-wrapper.component.scss'],
})
export class ChatboxWrapperComponent {
    channels: ClientChannel[];

    constructor(private readonly chatService: ChatService) {
        this.channels = this.chatService.channels;
    }

    handleSendMessage([channel, content]: [Channel, string]) {
        this.chatService.sendMessage(channel, content);
    }
}
