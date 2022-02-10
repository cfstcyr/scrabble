import { GameType } from '@app/classes/game/game.type';

export interface LobbyData {
    lobbyId: string;
    playerName: string;
    gameType: GameType;
    maxRoundTime: number;
    dictionary: string;
}