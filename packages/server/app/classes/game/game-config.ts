import { DictionarySummary } from '@app/classes/communication/dictionary-data';
import { PlayerData } from '@app/classes/communication/player-data';
import { RoundData } from '@app/classes/communication/round-data';
import { GameMode } from '@app/classes/game/game-mode';
import { GameType } from '@app/classes/game/game-type';
import Player from '@app/classes/player/player';
import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
import { Square } from '@app/classes/square';
import { TileReserveData } from '@app/classes/tile/tile.types';
import { Channel } from '@common/models/chat/channel';
import { WithIdOf } from '@common/types/id';

export interface GameConfigData {
    playerName: string;
    playerId: string;
    gameType: GameType;
    gameMode: GameMode;
    maxRoundTime: number;
    dictionary: DictionarySummary;
    virtualPlayerName?: string;
    virtualPlayerLevel?: VirtualPlayerLevel;
}

export interface GameConfig {
    player1: Player;
    gameType: GameType;
    gameMode: GameMode;
    maxRoundTime: number;
    dictionary: DictionarySummary;
}

export interface ReadyGameConfig extends GameConfig {
    player2: Player;
    player3: Player;
    player4: Player;
}

export interface ReadyGameConfigWithChannelId extends ReadyGameConfig, WithIdOf<Channel> {}

export interface StartGameData {
    player1: PlayerData;
    player2: PlayerData;
    player3: PlayerData;
    player4: PlayerData;
    gameType: GameType;
    gameMode: GameMode;
    maxRoundTime: number;
    dictionary: DictionarySummary;
    gameId: string;
    board: Square[][];
    tileReserve: TileReserveData[];
    round: RoundData;
}
