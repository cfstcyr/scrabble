import { Schema } from './schema';

export interface HighScore extends Schema {
    idHighScore: number;
    gameType: string;
    score: number;
}

export interface HighScorePlayer extends Schema {
    idHighScore: number;
    name: string;
}

export interface HighScoreWithPlayers extends HighScore {
    names: string[];
}
