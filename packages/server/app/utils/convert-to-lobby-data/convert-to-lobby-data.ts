import { LobbyData } from '@app/classes/communication/lobby-data';
import { GameConfig } from '@app/classes/game/game-config';

export const convertToLobbyData = (config: GameConfig, id: string): LobbyData => {
    return {
        dictionary: config.dictionary,
        hostName: config.player1.name,
        maxRoundTime: config.maxRoundTime,
        lobbyId: id,
        gameType: config.gameType,
        gameMode: config.gameMode,
    };
};
