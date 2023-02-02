import { Injectable } from '@angular/core';
import { ClientSocket } from '@app/classes/communication/socket-type';
import { Channel } from '@common/models/chat/channel';
import { ChatMessage } from '@common/models/chat/chat-message';
import SocketService from '@app/services/socket-service/socket.service';
import { ClientChannel } from '@app/classes/chat/channel';
import { UserService } from '@app/services/user-service/user.service';
import { NoId } from '@common/types/no-id';

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    channels: ClientChannel[] = [];

    constructor(private readonly socketService: SocketService, private readonly userService: UserService) {
        this.configureSocket(this.socketService.socket);

        this.createChannel({ name: 'test channel' });
    }

    configureSocket(socket: ClientSocket): void {
        socket.on('channel:join', (channel: Channel) => {
            this.channels.push({ ...channel, messages: [] });
        });

        socket.on('channel:quit', (channel: Channel) => {
            const index = this.channels.findIndex(({ id }) => id === channel.id);
            this.channels.splice(index, 0);
        });

        socket.on('channel:newMessage', (channelId: string, message: ChatMessage) => {
            if (this.userService.isUser(message.sender)) return;
            const channel = this.getChannel(channelId);
            channel.messages.push(message);
        });

        socket.emit('channel:init');
    }

    sendMessage(channel: Channel, content: string): void {
        this.socketService.socket.emit('channel:newMessage', channel, {
            content,
            sender: this.userService.user,
        });
    }

    createChannel(channel: NoId<Channel>): void {
        this.socketService.socket.emit('channel:newChannel', channel);
    }

    private getChannel(id: string): ClientChannel {
        const index = this.channels.findIndex((c) => id === c.id);

        if (index < 0) throw new Error(`No channel with ID "${id}"`);

        return this.channels[index];
    }
}
