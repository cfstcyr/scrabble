import { GENERAL_CHANNEL } from '@app/constants/chat';
import { ALREADY_EXISTING_CHANNEL_NAME, ALREADY_IN_CHANNEL, INEXISTING_CHANNEL_NAME, NOT_IN_CHANNEL } from '@app/constants/services-errors';
import { ClientEvents, ServerEvents } from '@common/events/events';
import { Channel } from '@common/models/chat/channel';
import { ChatMessage } from '@common/models/chat/chat-message';
import { NoId } from '@common/types/no-id';
import { StatusCodes } from 'http-status-codes';
import { Socket } from 'socket.io';
import { Service } from 'typedi';

@Service()
export class ChatService {
    // TODO: Remove once DB is setup
    private channels: Channel[];

    constructor() {
        this.channels = [GENERAL_CHANNEL];
    }

    configureSocket(socket: Socket<ClientEvents, ServerEvents>): void {
        socket.on('channel:newMessage', (channel: NoId<Channel>, chatMessage: ChatMessage) => this.sendMessage(channel, socket, chatMessage));
        socket.on('channel:newChannel', (channel: NoId<Channel>) => this.createChannel(channel, socket));
        socket.on('channel:join', (channel: Channel) => this.joinChannel(channel.name, socket));
        socket.on('channel:quit', (channel: Channel) => this.quitChannel(channel.name, socket));

        this.joinChannel(GENERAL_CHANNEL.name, socket);
        // TODO: Join all channels in DB that the user is in
    }

    private sendMessage(channel: NoId<Channel>, socket: Socket<ClientEvents, ServerEvents>, chatMessage: ChatMessage): void {
        if (!this.channels.find((c) => c.name === channel.name)) {
            socket.emit('error', INEXISTING_CHANNEL_NAME, StatusCodes.BAD_REQUEST);
        }

        socket.nsp.to(channel.name).emit('channel:newMessage', chatMessage);
        // TODO: Save message in DB
    }

    private createChannel(channel: NoId<Channel>, socket: Socket<ClientEvents, ServerEvents>): void {
        if (this.channels.find((c) => c.name === channel.name)) {
            socket.emit('error', ALREADY_EXISTING_CHANNEL_NAME, StatusCodes.FORBIDDEN);
        }
        this.channels.push({ ...channel, id: String(this.channels.length) });

        socket.emit('channel:newChannel', `Channel ${channel.name} created successfully`);
        // TODO: Save channel in DB
    }

    private joinChannel(channelName: string, socket: Socket<ClientEvents, ServerEvents>): void {
        if (!this.channels.find((channel) => channel.name === channelName)) {
            socket.emit('error', INEXISTING_CHANNEL_NAME, StatusCodes.BAD_REQUEST);
        }
        if (socket.rooms.has(channelName)) {
            socket.emit('error', ALREADY_IN_CHANNEL, StatusCodes.BAD_REQUEST);
        }

        socket.join(channelName);
        socket.emit('channel:join', `Channel ${channelName} joined now`);
        // TODO: Save user joined channel in DB
    }

    private quitChannel(channelName: string, socket: Socket<ClientEvents, ServerEvents>): void {
        if (!this.channels.find((channel) => channel.name === channelName)) {
            socket.emit('error', INEXISTING_CHANNEL_NAME, StatusCodes.BAD_REQUEST);
        }
        if (!socket.rooms.has(channelName)) {
            socket.emit('error', NOT_IN_CHANNEL, StatusCodes.BAD_REQUEST);
        }

        socket.leave(channelName);
        socket.emit('channel:quit', `Channel ${channelName} left`);
        // TODO: Save user left channel in DB
    }
}
