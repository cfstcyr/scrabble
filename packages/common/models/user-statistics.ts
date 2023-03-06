import { WithIdOf } from '../types/id';
import { User } from './user';

export interface UserStatistics extends WithIdOf<User> {
    gamesPlayedCount: number;
    gamesWonCount: number;
    averagePointsPerGame: number;
    averageTimePerGame: number;
}

export type PublicUserStatistics = Omit<UserStatistics, 'idUser'>;

export interface UserGameStatisticInfo {
    points: number;
    time: number;
    hasWon: boolean;
}
