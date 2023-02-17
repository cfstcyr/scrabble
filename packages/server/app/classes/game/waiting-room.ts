import Player from '@app/classes/player/player';
import { Channel } from '@common/models/chat/channel';
import { TypeOfId } from '@common/types/id';
import { GameConfig } from './game-config';
import Room from './room';

export default class WaitingRoom extends Room {
    joinedPlayer2?: Player;
    joinedPlayer3?: Player;
    joinedPlayer4?: Player;
    private config: GameConfig;
    private readonly groupChannelId: TypeOfId<Channel>;

    constructor(config: GameConfig, groupChannelId: TypeOfId<Channel>) {
        super();
        this.config = config;
        this.joinedPlayer2 = undefined;
        this.joinedPlayer3 = undefined;
        this.joinedPlayer4 = undefined;
        this.groupChannelId = groupChannelId;
    }

    getConfig(): GameConfig {
        return this.config;
    }

    getGroupChannelId(): TypeOfId<Channel> {
        return this.groupChannelId;
    }

    fillNextEmptySpot(player: Player): void {
        if (!this.joinedPlayer2) {
            this.joinedPlayer2 = player;
            return;
        } else if (!this.joinedPlayer3) {
            this.joinedPlayer3 = player;
            return;
        } else if (!this.joinedPlayer4) {
            this.joinedPlayer4 = player;
            return;
        }
        throw new HttpException(GAME_ALREADY_FULL, StatusCodes.FORBIDDEN);
    }
}
