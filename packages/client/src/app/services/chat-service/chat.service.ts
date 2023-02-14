import { Injectable } from '@angular/core';
import { ClientChannel } from '@app/classes/chat/channel';
import { ClientSocket } from '@app/classes/communication/socket-type';
import SocketService from '@app/services/socket-service/socket.service';
import { UserService } from '@app/services/user-service/user.service';
import { Channel } from '@common/models/chat/channel';
import { ChannelMessage } from '@common/models/chat/chat-message';
import { TypeOfId } from '@common/types/id';
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
    }

    sendMessage(channel: Channel, content: string): void {
        this.socketService.socket.emit('channel:newMessage', {
            idChannel: channel.idChannel,
            message: {
                content,
                sender: this.userService.user,
                date: new Date(),
            },
        });
    }

    createChannel(channelName: string): void {
        this.socketService.socket.emit('channel:newChannel', { name: channelName });
    }

    joinChannel(idChannel: TypeOfId<Channel>): void {
        this.socketService.socket.emit('channel:join', idChannel);
    }

    quitChannel(idChannel: TypeOfId<Channel>): void {
        this.socketService.socket.emit('channel:quit', idChannel);
    }

    handleJoinChannel(channel: Channel): void {
        const newChannel = { ...channel, messages: [] };
        this.channels.push(newChannel);
        this.joinedChannel.next(newChannel);
    }

    handleChannelQuit(channel: Channel): void {
        const index = this.channels.findIndex(({ idChannel }) => idChannel === channel.idChannel);
        if (index >= 0) this.channels.splice(index, 1);
    }

    handleNewMessage(channelMessage: ChannelMessage): void {
        const message = channelMessage.message;
        const channel = this.getChannel(channelMessage.idChannel);
        channel.messages.push({
            ...message,
            date: new Date(message.date),
        });
    }

    private getChannel(idChannel: TypeOfId<Channel>): ClientChannel {
        const index = this.channels.findIndex((c) => idChannel === c.idChannel);

        if (index < 0) throw new Error(`No channel with ID "${idChannel}"`);

        return this.channels[index];
    }
}
