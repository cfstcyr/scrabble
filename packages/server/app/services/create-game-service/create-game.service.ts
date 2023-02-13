import { GameConfig, GameConfigData, ReadyGameConfig, StartGameData } from '@app/classes/game/game-config';
import WaitingRoom from '@app/classes/game/waiting-room';
import Player from '@app/classes/player/player';
import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
import { BeginnerVirtualPlayer } from '@app/classes/virtual-player/beginner-virtual-player/beginner-virtual-player';
import { ExpertVirtualPlayer } from '@app/classes/virtual-player/expert-virtual-player/expert-virtual-player';
import { ActiveGameService } from '@app/services/active-game-service/active-game.service';
import { Service } from 'typedi';
import { v4 as uuidv4 } from 'uuid';

@Service()
export class CreateGameService {
    constructor(private activeGameService: ActiveGameService) {}
    async createSoloGame(config: GameConfigData): Promise<StartGameData> {
        const gameId = uuidv4();
        let readyGameConfig;
        if (config.virtualPlayerLevel === VirtualPlayerLevel.Beginner) {
            readyGameConfig = this.generateReadyGameConfig(
                new BeginnerVirtualPlayer(gameId, config.virtualPlayerName as string),
                new BeginnerVirtualPlayer(gameId, config.virtualPlayerName as string),
                new BeginnerVirtualPlayer(gameId, config.virtualPlayerName as string),
                this.generateGameConfig(config),
            );
        } else {
            readyGameConfig = this.generateReadyGameConfig(
                new ExpertVirtualPlayer(gameId, config.virtualPlayerName as string),
                new ExpertVirtualPlayer(gameId, config.virtualPlayerName as string),
                new ExpertVirtualPlayer(gameId, config.virtualPlayerName as string),
                this.generateGameConfig(config),
            );
        }

        return this.activeGameService.beginGame(gameId, readyGameConfig);
    }

    createMultiplayerGame(configData: GameConfigData): WaitingRoom {
        const config = this.generateGameConfig(configData);
        return new WaitingRoom(config);
    }

    private generateGameConfig(configData: GameConfigData): GameConfig {
        return {
            player1: new Player(configData.playerId, configData.playerName),
            gameType: configData.gameType,
            gameMode: configData.gameMode,
            maxRoundTime: configData.maxRoundTime,
            dictionary: configData.dictionary,
        };
    }

    private generateReadyGameConfig(player2: Player, player3: Player, player4: Player, gameConfig: GameConfig): ReadyGameConfig {
        return {
            ...gameConfig,
            player2,
            player3,
            player4,
        };
    }
}
