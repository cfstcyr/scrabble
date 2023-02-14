import { ServerSocket } from '@app/classes/communication/socket-type';
import { GENERAL_CHANNEL } from '@app/constants/chat';
import { ALREADY_EXISTING_CHANNEL_NAME, ALREADY_IN_CHANNEL, CHANNEL_NAME_DOES_NOT_EXIST, NOT_IN_CHANNEL } from '@app/constants/services-errors';
import { Channel } from '@common/models/chat/channel';
import { ChannelMessage } from '@common/models/chat/chat-message';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class ChatService {
    // TODO: Remove once DB is setup
    private channels: Channel[];

    constructor() {
        this.channels = [GENERAL_CHANNEL];
    }

    configureSocket(socket: ServerSocket): void {
        socket.on('channel:newMessage', (channelMessage: ChannelMessage) => this.sendMessage(channelMessage, socket));
        socket.on('channel:newChannel', (channelName: string) => this.createChannel(channelName, socket));
        socket.on('channel:join', (channel: string) => this.joinChannel(channel, socket));
        socket.on('channel:quit', (channel: string) => this.quitChannel(channel, socket));
        socket.on('channel:init', () => {
            this.joinChannel(GENERAL_CHANNEL.name, socket);
            // TODO: Join all channels in DB that the user is in
        });
    }

    private sendMessage(channelMessage: ChannelMessage, socket: ServerSocket): void {
        // eslint-disable-next-line no-console
        const channel = channelMessage.channel;
        const foundChannel = this.getChannel(channel?.name);
        if (!foundChannel) {
            socket.emit('error', CHANNEL_NAME_DOES_NOT_EXIST, StatusCodes.BAD_REQUEST);
            return;
        }

        if (!socket.rooms.has(channel?.name)) {
            socket.emit('error', NOT_IN_CHANNEL, StatusCodes.FORBIDDEN);
            return;
        }

        socket.to(channel.name).emit('channel:newMessage', channelMessage);
        // TODO: Save message in DB
    }

    private createChannel(channelName: string, socket: ServerSocket): void {
        if (this.getChannel(channelName)) {
            socket.emit('error', ALREADY_EXISTING_CHANNEL_NAME, StatusCodes.FORBIDDEN);
            return;
        }
        const newChannel: Channel = { name: channelName, id: String(this.channels.length + 1), canQuit: true };

        this.channels.push(newChannel);

        socket.emit('channel:newChannel', newChannel);
        // TODO: Save channel in DB

        this.joinChannel(channelName, socket);
    }

    private joinChannel(channelName: string, socket: ServerSocket): void {
        const channel = this.getChannel(channelName);

        if (!channel) {
            socket.emit('error', CHANNEL_NAME_DOES_NOT_EXIST, StatusCodes.BAD_REQUEST);
            return;
        }

        if (socket.rooms.has(channelName)) {
            socket.emit('error', ALREADY_IN_CHANNEL, StatusCodes.BAD_REQUEST);
            return;
        }

        socket.join(channelName);
        socket.emit('channel:join', channel);
        // TODO: Save user joined channel in DB
    }

    private quitChannel(channelName: string, socket: ServerSocket): void {
        const channel = this.getChannel(channelName);

        if (!channel) {
            socket.emit('error', CHANNEL_NAME_DOES_NOT_EXIST, StatusCodes.BAD_REQUEST);
            return;
        }
        if (!socket.rooms.has(channelName)) {
            socket.emit('error', NOT_IN_CHANNEL, StatusCodes.BAD_REQUEST);
            return;
        }

        socket.leave(channelName);
        socket.emit('channel:quit', channel);
        // TODO: Save user left channel in DB
    }

    private getChannel(channelName: string): Channel | undefined {
        return this.channels.find((c) => c.name === channelName);
    }
}
