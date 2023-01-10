import { GameMode } from '@app/constants/game-mode';
import { GameType } from '@app/constants/game-type';
import { DictionarySummary } from './dictionary-summary';

export default interface LobbyData {
    lobbyId: string;
    hostName: string;
    gameType: GameType;
    gameMode: GameMode;
    maxRoundTime: number;
    dictionary: DictionarySummary;
}
