import Player from '@app/classes/player/player';
import { GAME_ALREADY_FULL } from '@app/constants/classes-errors';
import { Channel } from '@common/models/chat/channel';
import { TypeOfId } from '@common/types/id';
import { StatusCodes } from 'http-status-codes';
import { HttpException } from '@app/classes/http-exception/http-exception';
import { GameConfig } from './game-config';
import Room from './room';
import { DictionarySummary } from '@app/classes/communication/dictionary-data';
import { Group } from '@common/models/group';

export default class WaitingRoom extends Room {
    joinedPlayer2?: Player;
    joinedPlayer3?: Player;
    joinedPlayer4?: Player;
    requestingPlayers: Player[];
    dictionarySummary: DictionarySummary;

    private config: GameConfig;
    private readonly groupChannelId: TypeOfId<Channel>;

    constructor(config: GameConfig, groupChannelId: TypeOfId<Channel>) {
        super();
        this.config = config;
        this.joinedPlayer2 = undefined;
        this.joinedPlayer3 = undefined;
        this.joinedPlayer4 = undefined;
        this.requestingPlayers = [];
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
        throw new HttpException(GAME_ALREADY_FULL, StatusCodes.UNAUTHORIZED);
    }

    getPlayers(): Player[] {
        const players = [this.config.player1];
        if (this.joinedPlayer2) {
            players.push(this.joinedPlayer2);
        }
        if (this.joinedPlayer3) {
            players.push(this.joinedPlayer3);
        }
        if (this.joinedPlayer4) {
            players.push(this.joinedPlayer4);
        }
        return players;
    }

    convertToGroup(): Group {
        return {
            user1: this.config.player1.publicUser,
            user2: this.joinedPlayer2?.publicUser ?? undefined,
            user3: this.joinedPlayer3?.publicUser ?? undefined,
            user4: this.joinedPlayer4?.publicUser ?? undefined,
            maxRoundTime: this.config.maxRoundTime,
            gameVisibility: this.config.gameVisibility,
            virtualPlayerLevel: this.config.virtualPlayerLevel,
            // TODO: Check fi this what we want
            groupId: this.getId(),
            password: this.getConfig().password,
        };
    }
}
