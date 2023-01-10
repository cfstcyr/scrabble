import { GameType } from '@app/classes/game/game-type';

export interface HighScore {
    gameType: GameType;
    score: number;
    names: string[];
}

export interface HighScoresData {
    highScores: HighScore[];
}
