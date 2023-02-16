import { ServerSocket } from '@app/classes/communication/socket-type';
import { DEFAULT_CHANNELS } from '@app/constants/chat';
import { ALREADY_EXISTING_CHANNEL_NAME, ALREADY_IN_CHANNEL, CHANNEL_DOES_NOT_EXISTS, NOT_IN_CHANNEL } from '@app/constants/services-errors';
import { Channel, ChannelCreation } from '@common/models/chat/channel';
import { ChannelMessage } from '@common/models/chat/chat-message';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';
import { TypeOfId } from '@common/types/id';
import { getSocketNameFromChannel } from '@app/utils/socket';
import { SocketService } from '@app/services/socket-service/socket.service';
import { HttpException } from '@app/classes/http-exception/http-exception';
import { ServerUser } from '@common/models/user';
import { ChatPersistenceService } from '@app/services/chat-persistence-service/chat-persistence.service';

@Service()
export class ChatService {
    private defaultChannels = DEFAULT_CHANNELS;

    constructor(private readonly chatPersistenceService: ChatPersistenceService) {}

    async initialize(): Promise<void> {
        await this.chatPersistenceService.createDefaultChannels(this.defaultChannels);
    }

    configureSocket(socket: ServerSocket): void {
        socket.on('channel:newMessage', async (channelMessage: ChannelMessage) => {
            try {
                await this.sendMessage(channelMessage, socket);
            } catch (error) {
                SocketService.handleError(error, socket);
            }
        });
        socket.on('channel:newChannel', async (channel: ChannelCreation) => {
            try {
                await this.createChannel(channel, socket);
            } catch (error) {
                SocketService.handleError(error, socket);
            }
        });
        socket.on('channel:join', async (idChannel: TypeOfId<Channel>) => {
            try {
                await this.joinChannel(idChannel, socket);
            } catch (error) {
                SocketService.handleError(error, socket);
            }
        });
        socket.on('channel:quit', async (idChannel: TypeOfId<Channel>) => {
            try {
                await this.quitChannel(idChannel, socket);
            } catch (error) {
                SocketService.handleError(error, socket);
            }
        });
        socket.on('channel:init', async () => {
            try {
                await this.initChannelsForSocket(socket);
            } catch (error) {
                SocketService.handleError(error, socket);
            }
        });
    }

    private async sendMessage(channelMessage: ChannelMessage, socket: ServerSocket): Promise<void> {
        const channel = await this.chatPersistenceService.getChannel(channelMessage.idChannel);

        if (!channel) {
            throw new HttpException(CHANNEL_DOES_NOT_EXISTS, StatusCodes.BAD_REQUEST);
        }

        if (!socket.rooms.has(getSocketNameFromChannel(channel))) {
            throw new HttpException(NOT_IN_CHANNEL, StatusCodes.FORBIDDEN);
        }

        socket.to(getSocketNameFromChannel(channel)).emit('channel:newMessage', channelMessage);

        // TODO: Save message in DB
    }

    private async createChannel(channel: ChannelCreation, socket: ServerSocket): Promise<Channel | undefined> {
        if (!(await this.chatPersistenceService.isChannelNameAvailable(channel))) {
            throw new HttpException(ALREADY_EXISTING_CHANNEL_NAME, StatusCodes.FORBIDDEN);
        }

        const newChannel = await this.chatPersistenceService.saveChannel(channel);

        socket.emit('channel:newChannel', newChannel);

        this.joinChannel(newChannel.idChannel, socket);

        return newChannel;
    }

    private async joinChannel(idChannel: TypeOfId<Channel>, socket: ServerSocket): Promise<Channel | undefined> {
        const user: ServerUser = socket.data.user;
        const channel = await this.chatPersistenceService.getChannel(idChannel);

        if (!channel) {
            throw new HttpException(CHANNEL_DOES_NOT_EXISTS, StatusCodes.BAD_REQUEST);
        }

        if (socket.rooms.has(getSocketNameFromChannel(channel))) {
            throw new HttpException(ALREADY_IN_CHANNEL, StatusCodes.BAD_REQUEST);
        }

        // This method is used to subscribe to a channel of join an already subscribed channel.
        // We only need to add to the table if not already there.
        await this.chatPersistenceService.joinChannel(idChannel, user.idUser);

        socket.join(getSocketNameFromChannel(channel));
        socket.emit('channel:join', channel);

        return channel;
    }

    private async quitChannel(idChannel: TypeOfId<Channel>, socket: ServerSocket): Promise<void> {
        const user: ServerUser = socket.data.user;
        const channel = await this.chatPersistenceService.getChannel(idChannel);

        if (!channel) {
            throw new HttpException(CHANNEL_DOES_NOT_EXISTS, StatusCodes.BAD_REQUEST);
        }

        if (socket.rooms.has(getSocketNameFromChannel(channel))) {
            socket.leave(getSocketNameFromChannel(channel));
        }

        await this.chatPersistenceService.leaveChannel(idChannel, user.idUser);

        socket.emit('channel:quit', channel);
    }

    private async initChannelsForSocket(socket: ServerSocket): Promise<void> {
        const user: ServerUser = socket.data.user;

        await Promise.all(
            (await this.chatPersistenceService.getUserChannelIds(user.idUser)).map(async (idChannel) => this.joinChannel(idChannel, socket)),
        );
    }
}
