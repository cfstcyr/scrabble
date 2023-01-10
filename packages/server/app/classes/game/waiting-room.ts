import Player from '@app/classes/player/player';
import { GameConfig } from './game-config';
import Room from './room';

export default class WaitingRoom extends Room {
    joinedPlayer?: Player;
    private config: GameConfig;

    constructor(config: GameConfig) {
        super();
        this.config = config;
        this.joinedPlayer = undefined;
    }

    getConfig(): GameConfig {
        return this.config;
    }
}
