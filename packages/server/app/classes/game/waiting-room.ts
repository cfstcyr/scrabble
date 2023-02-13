import Player from '@app/classes/player/player';
import { StatusCodes } from 'http-status-codes';
import { HttpException } from '../http-exception/http-exception';
import { GameConfig } from './game-config';
import Room from './room';

export default class WaitingRoom extends Room {
    joinedPlayer2?: Player;
    joinedPlayer3?: Player;
    joinedPlayer4?: Player;
    private config: GameConfig;

    constructor(config: GameConfig) {
        super();
        this.config = config;
        this.joinedPlayer2 = undefined;
        this.joinedPlayer3 = undefined;
        this.joinedPlayer4 = undefined;
    }

    getConfig(): GameConfig {
        return this.config;
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
        throw new HttpException('La partie est deja remplie', StatusCodes.FORBIDDEN);
    }
}
