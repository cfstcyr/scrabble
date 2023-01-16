import { NoId } from './schema';

export interface HighScore {
    idHighScore: number;
    gameType: string;
    score: number;
}

export interface HighScorePlayer {
    idHighScore: number;
    name: string;
}

export interface HighScoreWithPlayers extends HighScore {
    names: string[];
}

export interface HighScoresData {
    highScores: NoId<HighScoreWithPlayers>[];
}
