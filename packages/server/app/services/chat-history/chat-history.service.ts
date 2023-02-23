import { CHAT_HISTORY_TABLE } from '@app/constants/services-constants/database-const';
import { AuthentificationService } from '@app/services/authentification-service/authentification.service';
import DatabaseService from '@app/services/database-service/database.service';
import { Channel } from '@common/models/chat/channel';
import { ChannelMessage, ChatHistoryMessage } from '@common/models/chat/chat-message';
import { UNKOWN_USER } from '@common/models/user';
import { TypeOfId } from '@common/types/id';
import { Service } from 'typedi';

@Service()
export class ChatHistoryService {
    constructor(private databaseService: DatabaseService, private authentificationService: AuthentificationService) {}

    async saveMessage(message: ChannelMessage): Promise<void> {
        try {
            const user = await this.authentificationService.getUserByEmail(message.message.sender.email);

            await this.table.insert({
                idChannel: message.idChannel,
                idUser: user.idUser,
                content: message.message.content,
                date: message.message.date,
            });
        } catch {
            return;
        }
    }

    async getChannelHistory(idChannel: TypeOfId<Channel>): Promise<ChannelMessage[]> {
        const channelHistory = await this.table.select('*').where('idChannel', idChannel);

        return await Promise.all(
            channelHistory.map(async (message: ChatHistoryMessage) => {
                let user;
                try {
                    user = await this.authentificationService.getUserById(message.idUser);
                } catch {
                    user = UNKOWN_USER;
                }

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
