import { Injectable } from '@angular/core';
import { ClientChannel } from '@app/classes/chat/channel';
import { ClientSocket } from '@app/classes/communication/socket-type';
import SocketService from '@app/services/socket-service/socket.service';
import { UserService } from '@app/services/user-service/user.service';
import { Channel } from '@common/models/chat/channel';
import { ChannelMessage } from '@common/models/chat/chat-message';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    channels: ClientChannel[] = [];
    joinedChannel: Subject<ClientChannel>;

    constructor(private readonly socketService: SocketService, private readonly userService: UserService) {
        this.configureSocket(this.socketService.socket);
        this.joinedChannel = new Subject();
    }

    configureSocket(socket: ClientSocket): void {
        socket.on('channel:join', this.handleJoinChannel.bind(this));
        socket.on('channel:quit', this.handleChannelQuit.bind(this));
        socket.on('channel:newMessage', this.handleNewMessage.bind(this));

        socket.emit('channel:init');
        socket.emit('user:authentificate', 'token');
    }

    sendMessage(channel: Channel, content: string): void {
        this.socketService.socket.emit('channel:newMessage', {
            channel,
            message: {
                content,
                sender: this.userService.user,
                date: new Date(),
            },
        });
    }

    createChannel(channelName: string): void {
        this.socketService.socket.emit('channel:newChannel', channelName);
    }

    joinChannel(channel: string): void {
        this.socketService.socket.emit('channel:join', channel);
    }

    quitChannel(channel: string): void {
        this.socketService.socket.emit('channel:quit', channel);
    }

    handleJoinChannel(channel: Channel): void {
        const newChannel = { ...channel, messages: [] };
        this.channels.push(newChannel);
        this.joinedChannel.next(newChannel);
    }

    handleChannelQuit(channel: Channel): void {
        const index = this.channels.findIndex(({ id }) => id === channel.id);
        if (index >= 0) this.channels.splice(index, 1);
    }

    handleNewMessage(channelMessage: ChannelMessage): void {
        const message = channelMessage.message;
        const channel = this.getChannel(channelMessage.channel.id);
        channel.messages.push({
            ...message,
            date: new Date(message.date),
        });
    }

    private getChannel(id: string): ClientChannel {
        const index = this.channels.findIndex((c) => id === c.id);

        if (index < 0) throw new Error(`No channel with ID "${id}"`);

        return this.channels[index];
    }
}
