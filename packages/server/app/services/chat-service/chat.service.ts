import { HttpException } from '@app/classes/http-exception/http-exception';
import { GENERAL_CHANNEL } from '@app/constants/chat';
import { ALREADY_EXISTING_CHANNEL_NAME, INEXISTING_CHANNEL_NAME } from '@app/constants/services-errors';
import { ClientEvents, ServerEvents } from '@common/events/chat.event';
import { Channel } from '@common/models/chat/channel';
import { ChatMessage } from '@common/models/chat/chat-message';
import { NoId } from '@common/types/no-id';
import { StatusCodes } from 'http-status-codes';
import { Socket } from 'socket.io';
import { Service } from 'typedi';

@Service()
export class ChatService {
    private channels: Channel[];

    constructor() {
        this.channels = [GENERAL_CHANNEL];
    }

    configureSocket(socket: Socket<ClientEvents, ServerEvents>): void {
        try {
            socket.on('channel:newMessage', (channel: NoId<Channel>, chatMessage: ChatMessage) => this.sendMessage(channel, socket, chatMessage));
            socket.on('channel:newChannel', (channel: NoId<Channel>) => this.createChannel(channel, socket));
            socket.on('channel:join', (channel: Channel) => this.joinChannel(channel.name, socket));
            socket.on('channel:quit', (channel: Channel) => this.quitChannel(channel.name, socket));
        } catch (exception: unknown) {
            // eslint-disable-next-line no-console
            console.log((exception as HttpException).message);
        }
    }

    newSocketConnected(socket: Socket<ClientEvents, ServerEvents>): void {
        this.joinChannel(GENERAL_CHANNEL.name, socket);
    }

    private sendMessage(channel: NoId<Channel>, socket: Socket<ClientEvents, ServerEvents>, chatMessage: ChatMessage): void {
        if (!this.channels.find((c) => c.name === channel.name)) {
            throw new HttpException(INEXISTING_CHANNEL_NAME, StatusCodes.BAD_REQUEST);
        }

        socket.nsp.to(channel.name).emit('channel:newMessage', chatMessage);
    }

    private createChannel(channel: NoId<Channel>, socket: Socket<ClientEvents, ServerEvents>): void {
        if (!this.channels.find((c) => c.name === channel.name)) {
            throw new HttpException(ALREADY_EXISTING_CHANNEL_NAME, StatusCodes.FORBIDDEN);
        }
        this.channels.push({ ...channel, id: String(this.channels.length) });

        socket.emit('channel:newChannel', `Channel ${channel.name} created successfully`);
    }

    private joinChannel(channelName: string, socket: Socket): void {
        if (!this.channels.find((channel) => channel.name === channelName)) {
            throw new HttpException(INEXISTING_CHANNEL_NAME, StatusCodes.BAD_REQUEST);
        }

        socket.join(channelName);
        socket.emit('channel:join', `Channel ${channelName} joined now`);
    }

    private quitChannel(channelName: string, socket: Socket): void {
        if (!this.channels.find((channel) => channel.name === channelName)) {
            throw new HttpException(INEXISTING_CHANNEL_NAME, StatusCodes.BAD_REQUEST);
        }
        socket.emit('channel:quit', `Channel ${channelName} left`);
    }
}
