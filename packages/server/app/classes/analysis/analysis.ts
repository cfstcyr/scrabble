import { ActionTurnEndingType } from '@app/classes/communication/action-data';
import { Square } from '@app/classes/square';
import { Tile } from '@app/classes/tile';
import { UserId } from '@app/classes/user/connected-user-types';
import { ScoredWordPlacement } from '@app/classes/word-finding';
import { Board } from '@app/classes/board';

export interface Analysis {
    gameId: string;
    userId: UserId;
    criticalMoments: CriticalMoment[];
}

export interface CriticalMoment {
    tiles: Tile[];
    actionType: ActionTurnEndingType;
    playedPlacement?: ScoredWordPlacement;
    board: Board;
    // board: (Square | undefined)[];
    bestPlacement: ScoredWordPlacement;
}
