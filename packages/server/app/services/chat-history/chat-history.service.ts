import { Service } from 'typedi';
import DatabaseService from '@app/services/database-service/database.service';
import { CHAT_HISTORY_TABLE } from '@app/constants/services-constants/database-const';
import { ChatHistoryMessage } from '@common/models/chat/chat-message';

@Service()
export class ChatHistoryService {
    constructor(private databaseService: DatabaseService) { }

    private get table() {
        return this.databaseService.knex<ChatHistoryMessage>(CHAT_HISTORY_TABLE);
    }
}
