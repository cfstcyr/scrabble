import { GameType } from '@app/constants/game-type';

export default interface HighScore {
    score: number;
    names: string[];
    gameType: GameType;
}

export interface SingleHighScore {
    rank?: number;
    score: number;
    name: string;
    gameType: GameType;
}
