import Player from '@app/classes/player/player';
import { Channel } from '@common/models/chat/channel';
import { TypeOfId } from '@common/types/id';
import { GameConfig } from './game-config';
import Room from './room';

export default class WaitingRoom extends Room {
    joinedPlayer?: Player;
    private config: GameConfig;
    private readonly groupChannelId: TypeOfId<Channel>;

    constructor(config: GameConfig, groupChannelId: TypeOfId<Channel>) {
        super();
        this.config = config;
        this.joinedPlayer = undefined;
        this.groupChannelId = groupChannelId;
    }

    getConfig(): GameConfig {
        return this.config;
    }

    getGroupChannelId(): TypeOfId<Channel> {
        return this.groupChannelId;
    }
}
