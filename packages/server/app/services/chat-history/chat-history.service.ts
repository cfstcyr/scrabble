import { Service } from 'typedi';
import DatabaseService from '@app/services/database-service/database.service';
import { CHAT_HISTORY_TABLE } from '@app/constants/services-constants/database-const';
import { ChannelMessage, ChatHistoryMessage } from '@common/models/chat/chat-message';
import { TypeOfId, NoId } from '@common/types/id';
import { Channel } from 'diagnostics_channel';

@Service()
export class ChatHistoryService {
    constructor(private databaseService: DatabaseService) { }

    async saveMessage(message: NoId<ChatHistoryMessage>): Promise<void> {
        // insert message into table;
    }

    async getChannelHistory(idChannel: TypeOfId<Channel>): Promise<ChannelMessage[]> {
        return [];
        // Get all messages from a channel
    }

    async deleteChannelHistory(idChannel: TypeOfId<Channel>): Promise<void> {
        // Delete all messages from a channel
    }

    private get table() {
        return this.databaseService.knex<ChatHistoryMessage>(CHAT_HISTORY_TABLE);
    }
}
