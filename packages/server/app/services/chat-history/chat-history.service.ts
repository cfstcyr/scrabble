import { Service } from 'typedi';
import DatabaseService from '@app/services/database-service/database.service';
import { CHAT_HISTORY_TABLE } from '@app/constants/services-constants/database-const';
import { ChannelMessage, ChatHistoryMessage } from '@common/models/chat/chat-message';
import { TypeOfId } from '@common/types/id';
import { Channel } from '@common/models/chat/channel';
import { AuthentificationService } from '@app/services/authentification-service/authentification.service';

@Service()
export class ChatHistoryService {
    constructor(private databaseService: DatabaseService, private authentificationService: AuthentificationService) {}

    async saveMessage(message: ChannelMessage): Promise<void> {
        const user = await this.authentificationService.getUserByEmail(message.message.sender.email);

        await this.table.insert({
            idChannel: message.idChannel,
            idUser: user.idUser,
            content: message.message.content,
            date: message.message.date,
        });
    }

    async getChannelHistory(idChannel: TypeOfId<Channel>): Promise<ChannelMessage[]> {
        const channelHistory = await this.table.select('*').where('idChannel', idChannel);

        return await Promise.all(
            channelHistory.map(async (message: ChatHistoryMessage) => {
                const user = await this.authentificationService.getUserById(message.idUser);

                return {
                    idChannel: message.idChannel,
                    message: {
                        sender: { email: user.email, username: user.username, avatar: user.avatar },
                        content: message.content,
                        date: message.date,
                    },
                };
            }),
        );
    }

    async deleteChannelHistory(idChannel: TypeOfId<Channel>): Promise<void> {
        await this.table.delete().where('idChannel', idChannel);
    }

    private get table() {
        return this.databaseService.knex<ChatHistoryMessage>(CHAT_HISTORY_TABLE);
    }
}
