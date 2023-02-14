import { ServerSocket } from '@app/classes/communication/socket-type';
import { DEFAULT_CHANNELS } from '@app/constants/chat';
import { ALREADY_EXISTING_CHANNEL_NAME, ALREADY_IN_CHANNEL, CHANNEL_DOES_NOT_EXISTS, NOT_IN_CHANNEL } from '@app/constants/services-errors';
import { Channel, ChannelCreation, UserChannel } from '@common/models/chat/channel';
import { ChannelMessage } from '@common/models/chat/chat-message';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';
import DatabaseService from '@app/services/database-service/database.service';
import { CHANNEL_TABLE, USER_CHANNEL_TABLE } from '@app/constants/services-constants/database-const';
import { AuthentificationService } from '@app/services/authentification-service/authentification.service';
import { TypeOfId } from '@common/types/id';
import { getSocketNameFromChannel } from '@app/utils/socket';
import { SocketService } from '@app/services/socket-service/socket.service';
import { HttpException } from '@app/classes/http-exception/http-exception';
import { User } from '@common/models/user';
import { PlayerData } from '@app/classes/communication/player-data';

@Service()
export class ChatService {
    private defaultChannels = DEFAULT_CHANNELS;

    constructor(
        private readonly databaseService: DatabaseService,
        private readonly authenticationService: AuthentificationService,
        private readonly socketService: SocketService,
    ) {
        this.socketService.listenToInitialisationEvent(this.configureSocket.bind(this));
    }

    async initialize(): Promise<void> {
        await this.createDefaultChannels();
    }

    async getChannels(): Promise<Channel[]> {
        return this.channelTable.select();
    }

    configureSocket(socket: ServerSocket): void {
        socket.on('channel:newMessage', async (channelMessage: ChannelMessage) => {
            try {
                await this.handleSendMessage(channelMessage, socket);
            } catch (error) {
                SocketService.handleError(error, socket);
            }
        });
        socket.on('channel:newChannel', async (channelName: string) => {
            try {
                await this.handleCreateChannel({ name: channelName }, socket);
            } catch (error) {
                SocketService.handleError(error, socket);
            }
        });
        socket.on('channel:join', async (idChannel: TypeOfId<Channel>) => {
            try {
                await this.handleJoinChannel(idChannel, socket);
            } catch (error) {
                SocketService.handleError(error, socket);
            }
        });
        socket.on('channel:quit', async (idChannel: TypeOfId<Channel>) => {
            try {
                await this.handleQuitChannel(idChannel, socket);
            } catch (error) {
                SocketService.handleError(error, socket);
            }
        });
        socket.on('channel:init', async () => {
            try {
                await this.handleInitChannels(socket);
            } catch (error) {
                SocketService.handleError(error, socket);
            }
        });
    }

    async createChannel(channel: ChannelCreation, playerId: TypeOfId<PlayerData>): Promise<Channel> {
        // TODO: Use socketId to playerId map to get socketId of player
        const socket: ServerSocket = this.socketService.getSocket(playerId);
        return this.handleCreateChannel(channel, socket);
    }

    async joinChannel(idChannel: TypeOfId<Channel>, playerId: TypeOfId<PlayerData>): Promise<void> {
        // TODO: Use socketId to playerId map to get socketId of player
        const socket: ServerSocket = this.socketService.getSocket(playerId);
        this.handleJoinChannel(idChannel, socket);
    }

    async quitChannel(idChannel: TypeOfId<Channel>, playerId: TypeOfId<PlayerData>): Promise<void> {
        // TODO: Use socketId to playerId map to get socketId of player
        const socket: ServerSocket = this.socketService.getSocket(playerId);
        this.handleQuitChannel(idChannel, socket);
    }

    async emptyChannel(idChannel: TypeOfId<Channel>): Promise<void> {
        // TODO: Use socketId to playerId map to get socketId of player
        const playerIdsInChannel: number[] = (await this.userChatTable.select('idUser').where({ idChannel })).map(
            (userChannel) => userChannel.idUser,
        );
        playerIdsInChannel.forEach((idUser) => {
            const socket: ServerSocket = this.socketService.getSocket(idUser.toString());
            this.handleQuitChannel(idChannel, socket);
        });
    }

    private async handleSendMessage(channelMessage: ChannelMessage, socket: ServerSocket): Promise<void> {
        const channel = await this.getChannel(channelMessage.idChannel);

        if (!channel) {
            throw new HttpException(CHANNEL_DOES_NOT_EXISTS, StatusCodes.BAD_REQUEST);
        }

        if (!socket.rooms.has(getSocketNameFromChannel(channel))) {
            throw new HttpException(NOT_IN_CHANNEL, StatusCodes.FORBIDDEN);
        }

        socket.to(getSocketNameFromChannel(channel)).emit('channel:newMessage', channelMessage);

        // TODO: Save message in DB
    }

    private async handleCreateChannel(channel: ChannelCreation, socket: ServerSocket): Promise<Channel> {
        await this.authenticationService.authenticateSocket(socket);

        if (!(await this.isChannelNameAvailable(channel))) {
            throw new HttpException(ALREADY_EXISTING_CHANNEL_NAME, StatusCodes.FORBIDDEN);
        }

        const newChannel = await this.saveChannel(channel);

        socket.emit('channel:newChannel', newChannel);

        this.handleJoinChannel(newChannel.idChannel, socket);

        return newChannel;
    }

    private async handleJoinChannel(idChannel: TypeOfId<Channel>, socket: ServerSocket): Promise<Channel> {
        const user = await this.authenticationService.authenticateSocket(socket);
        const channel = await this.getChannel(idChannel);

        if (!channel) {
            throw new HttpException(CHANNEL_DOES_NOT_EXISTS, StatusCodes.BAD_REQUEST);
        }

        if (socket.rooms.has(getSocketNameFromChannel(channel))) {
            throw new HttpException(ALREADY_IN_CHANNEL, StatusCodes.BAD_REQUEST);
        }

        // This method is used to subscribe to a channel of join an already subscribed channel.
        // We only need to add to the table if not already there.
        if (await this.isUserInChannel(idChannel, user.idUser)) {
            await this.userChatTable.insert({ idChannel, idUser: user.idUser });
        }

        socket.join(getSocketNameFromChannel(channel));
        socket.emit('channel:join', channel);

        return channel;
    }

    private async handleQuitChannel(idChannel: TypeOfId<Channel>, socket: ServerSocket): Promise<void> {
        const user = await this.authenticationService.authenticateSocket(socket);
        const channel = await this.getChannel(idChannel);

        if (!channel) {
            throw new HttpException(CHANNEL_DOES_NOT_EXISTS, StatusCodes.BAD_REQUEST);
        }

        if (socket.rooms.has(getSocketNameFromChannel(channel))) {
            socket.leave(getSocketNameFromChannel(channel));
        }

        if (await this.isUserInChannel(idChannel, user.idUser)) {
            await this.userChatTable.delete().where({ idChannel, idUser: user.idUser });
        }

        socket.emit('channel:quit', channel);
    }

    private async handleInitChannels(socket: ServerSocket): Promise<void> {
        const user = await this.authenticationService.authenticateSocket(socket);
        const channels = await this.channelTable
            .select('idChannel')
            .leftJoin<UserChannel>(USER_CHANNEL_TABLE, `${CHANNEL_TABLE}.idChannel`, `${USER_CHANNEL_TABLE}.idChannel`)
            .where(`${USER_CHANNEL_TABLE}.idUser`, user.idUser)
            .orWhere({ default: true });

        await Promise.all(channels.map(async ({ idChannel }) => this.handleJoinChannel(idChannel, socket)));
    }

    private async getChannel(idChannel: TypeOfId<Channel>): Promise<Channel | undefined> {
        return (await this.channelTable.select('*').where({ idChannel }))[0];
    }

    private async saveChannel(channel: ChannelCreation): Promise<Channel> {
        return (await this.channelTable.insert(channel).returning('*'))[0];
    }

    private async isChannelNameAvailable(channel: ChannelCreation): Promise<boolean> {
        if (channel.private) return true;

        const [{ count }] = (await this.channelTable.count('* as count').where({ name: channel.name })) as unknown as { count: number | string }[];

        return count === 0 || count === '0';
    }

    private async createDefaultChannels(): Promise<void> {
        for (const channel of this.defaultChannels) {
            const found = await this.channelTable.select('idChannel', 'name').where(channel);
            let insertNew = found.length === 0;

            if (found.length > 0 && found[0].name !== channel.name) {
                await this.channelTable.delete().where({ idChannel: found[0].idChannel });
                insertNew = true;
            }

            if (insertNew) {
                await this.channelTable.insert(channel);
            }
        }
    }

    private async isUserInChannel(idChannel: TypeOfId<Channel>, idUser: TypeOfId<User>): Promise<boolean> {
        return (await this.userChatTable.select('*').where({ idChannel, idUser })).length === 0;
    }

    private get channelTable() {
        return this.databaseService.knex<Channel>(CHANNEL_TABLE);
    }

    private get userChatTable() {
        return this.databaseService.knex<UserChannel>(USER_CHANNEL_TABLE);
    }
}
