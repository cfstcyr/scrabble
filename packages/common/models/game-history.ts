import { NoId } from '../types/no-id';

export interface GameHistoryPlayer {
    idGameHistoryPlayer: number;
    idGameHistory: number;
    playerIndex: number;
    name: string;
    score: number;
    isVirtualPlayer: boolean;
    isWinner: boolean;
}

export interface GameHistory {
    idGameHistory: number;
    startTime: Date;
    endTime: Date;
    gameType: string;
    gameMode: string;
    hasBeenAbandoned: boolean;
}

export interface GameHistoryWithPlayers extends GameHistory {
    playersData: GameHistoryPlayer[];
}

export type NoIdGameHistoryWithPlayers = NoId<GameHistoryWithPlayers, 'playerIndex'>;
