import Game from '@app/classes/game/game';
import { UserId } from '@app/classes/user/connected-user-types';
import EventEmitter = require('events');
import { Service } from 'typedi';
import { ChatService } from '../chat-service/chat.service';
import { SocketService } from '../socket-service/socket.service';

@Service()
export class AnalysisPersistenceService {


    constructor(private readonly databaseService: DatabaseService) {

    }

    async getChannels(): Promise<Channel[]> {
        return this.channelTable.select();
    }


    requestAnalysis(gameId: string, userId: UserId) {
        //
    }

    
    private async isChannelEmpty(idChannel: TypeOfId<Channel>): Promise<boolean> {
        return (await this.userChatTable.select('*').where({ idChannel })).length === 0;
    }

    private async isChannelPrivate(idChannel: TypeOfId<Channel>): Promise<boolean> {
        return (await this.channelTable.select('private').where({ idChannel }))[0].private;
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
