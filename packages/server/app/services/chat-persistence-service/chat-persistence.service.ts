import { CHANNEL_TABLE, USER_CHANNEL_TABLE } from '@app/constants/services-constants/database-const';
import { Channel, ChannelCreation, UserChannel } from '@common/models/chat/channel';
import { Service } from 'typedi';
import DatabaseService from '@app/services/database-service/database.service';
import { TypeOfId } from '@common/types/id';
import { User } from '@common/models/user';
import { UserId } from '@app/classes/user/connected-user-types';
import { ChatHistoryService } from '@app/services/chat-history/chat-history.service';

@Service()
export class ChatPersistenceService {
    constructor(private readonly databaseService: DatabaseService, private chatHistoryService: ChatHistoryService) {}

    async getChannels(): Promise<Channel[]> {
        return this.channelTable.select();
    }

    async getChannel(idChannel: TypeOfId<Channel>): Promise<Channel | undefined> {
        return (await this.channelTable.select('*').where({ idChannel }))[0];
    }

    async getUserChannelIds(idUser: TypeOfId<User>): Promise<TypeOfId<Channel>[]> {
        return (
            await this.channelTable
                .select(`${CHANNEL_TABLE}.idChannel`)
                .leftJoin<UserChannel>(USER_CHANNEL_TABLE, `${CHANNEL_TABLE}.idChannel`, `${USER_CHANNEL_TABLE}.idChannel`)
                .where(`${USER_CHANNEL_TABLE}.idUser`, idUser)
                .orWhere({ default: true })
        ).map(({ idChannel }) => idChannel);
    }

    async getChannelUserIds(idChannel: TypeOfId<Channel>): Promise<UserId[]> {
        return (await this.userChatTable.select('idUser').where({ idChannel })).map((userChannel) => userChannel.idUser);
    }

    async saveChannel(channel: ChannelCreation): Promise<Channel> {
        return (await this.channelTable.insert(channel).returning('*'))[0];
    }

    async joinChannel(idChannel: TypeOfId<Channel>, idUser: TypeOfId<User>): Promise<void> {
        if (!(await this.isUserInChannel(idChannel, idUser))) {
            await this.userChatTable.insert({ idChannel, idUser });
        }
    }

    async leaveChannel(idChannel: TypeOfId<Channel>, idUser: TypeOfId<User>): Promise<void> {
        await this.userChatTable.delete().where({ idChannel, idUser });

        if (await this.isChannelEmpty(idChannel)) {
            await this.chatHistoryService.deleteChannelHistory(idChannel);
        }
    }

    async isChannelNameAvailable(channel: ChannelCreation): Promise<boolean> {
        if (channel.private) return true;

        const [{ count }] = (await this.channelTable.count('* as count').where({ name: channel.name, private: false })) as unknown as {
            count: number | string;
        }[];

        return count === 0 || count === '0';
    }

    async createDefaultChannels(channels: ChannelCreation[]): Promise<void> {
        for (const channel of channels) {
            const found = await this.channelTable.select('idChannel', 'name', 'default').where({ name: channel.name, private: false });
            let insertNew = found.length === 0;

            if (found.length > 0 && (found[0].name !== channel.name || !found[0].default)) {
                await this.channelTable.delete().where({ idChannel: found[0].idChannel });
                insertNew = true;
            }

            if (insertNew) {
                await this.channelTable.insert({ ...channel, default: true });
            }
        }
    }

    private async isChannelEmpty(idChannel: TypeOfId<Channel>): Promise<boolean> {
        return (await this.userChatTable.select('*').where({ idChannel })).length === 0;
    }

    private async isUserInChannel(idChannel: TypeOfId<Channel>, idUser: TypeOfId<User>): Promise<boolean> {
        return (await this.userChatTable.select('*').where({ idChannel, idUser })).length > 0;
    }

    private get channelTable() {
        return this.databaseService.knex<Channel>(CHANNEL_TABLE);
    }

    private get userChatTable() {
        return this.databaseService.knex<UserChannel>(USER_CHANNEL_TABLE);
    }
}
