import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
import { Square } from '@app/classes/square';
import { TileReserveData } from '@app/classes/tile/tile.types';
import PlayerData from './player-data';
import { RoundData } from './round-data';

export interface GameConfigData {
    playerName: string;
    playerId: string;
    maxRoundTime: number;
    virtualPlayerName?: string;
    virtualPlayerLevel?: VirtualPlayerLevel;
}

export interface GameConfig {
    player1: PlayerData;
    maxRoundTime: number;
}

export interface ReadyGameConfig extends GameConfig {
    player2: PlayerData;
    player3: PlayerData;
    player4: PlayerData;
}

export interface StartGameData extends ReadyGameConfig {
    gameId: string;
    board: Square[][];
    tileReserve: TileReserveData[];
    round: RoundData;
}

export interface InitializeGameData {
    localPlayerId: string;
    startGameData: StartGameData;
}
