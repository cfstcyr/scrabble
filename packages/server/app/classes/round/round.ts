import Player from '@app/classes/player/player';
import { Action } from '@app/classes/actions';
import { Board } from '@app/classes/board';

export interface Round {
    player: Player;
    startTime: Date;
    limitTime: Date;
}

export interface CompletedRound extends Round {
    completedTime: Date;
    actionPlayed: Action;
    board: Board;
}
