import { GameConfig, GameConfigData } from '@app/classes/game/game-config';
import WaitingRoom from '@app/classes/game/waiting-room';
import Player from '@app/classes/player/player';
import { Service } from 'typedi';
import { ChatService } from '@app/services/chat-service/chat.service';
import { GROUP_CHANNEL } from '@app/constants/chat';
import { Channel } from '@common/models/chat/channel';
import { UserId } from '@app/classes/user/connected-user-types';

@Service()
export class CreateGameService {
    constructor(private readonly chatService: ChatService) {}

    async createMultiplayerGame(configData: GameConfigData, userId: UserId): Promise<WaitingRoom> {
        const config = this.generateGameConfig(configData);

        const channel: Channel = await this.chatService.createChannel(GROUP_CHANNEL, userId);

        return new WaitingRoom(config, channel.idChannel);
    }

    private generateGameConfig(configData: GameConfigData): GameConfig {
        return {
            player1: new Player(configData.playerId, configData.playerName),
            maxRoundTime: configData.maxRoundTime,
            gameMode: configData.gameMode,
            gameType: configData.gameType,
            dictionary: configData.dictionary,
        };
    }
}
