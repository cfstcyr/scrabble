import { DictionarySummary } from '@app/classes/communication/dictionary-data';
import { GameMode } from '@app/classes/game/game-mode';
import { GameType } from '@app/classes/game/game-type';

export interface LobbyData {
    lobbyId: string;
    hostName: string;
    gameType: GameType;
    gameMode: GameMode;
    maxRoundTime: number;
    dictionary: DictionarySummary;
}
