import { Schema } from "./schema";

export interface HighScore extends Schema {
    gameType: string;
    score: number;
}

export interface HighScorePlayer {
    highScoreId: number;
    name: string;
}

export interface HighScoreWithPlayers extends HighScore {
    names: string[];
}