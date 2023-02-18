import { GameConfig, GameConfigData } from '@app/classes/game/game-config';
import WaitingRoom from '@app/classes/game/waiting-room';
import Player from '@app/classes/player/player';
import { Service } from 'typedi';

@Service()
export class CreateGameService {
    createMultiplayerGame(configData: GameConfigData): WaitingRoom {
        const config = this.generateGameConfig(configData);
        return new WaitingRoom(config);
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

    // private generateReadyGameConfig(player2: Player, player3: Player, player4: Player, gameConfig: GameConfig): ReadyGameConfig {
    //     return {
    //         ...gameConfig,
    //         player2,
    //         player3,
    //         player4,
    //     };
    // }
}
