import { NoId, Schema } from './schema';

export interface GameHistoryPlayer extends Schema {
    gameHistoryId: number;
    playerIndex: number;
    name: string;
    score: number;
    isVirtualPlayer: boolean;
    isWinner: boolean;
}

export interface GameHistory extends Schema {
    startTime: Date;
    endTime: Date;
    gameType: string;
    gameMode: string;
    hasBeenAbandoned: boolean;
}

export interface GameHistoryWithPlayers extends GameHistory {
    playersData: GameHistoryPlayer[];
}

export type NoIdGameHistoryWithPlayers = NoId<GameHistoryWithPlayers, 'gameHistoryId' | 'playerIndex'>;
