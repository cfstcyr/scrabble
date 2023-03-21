import { ActionTurnEndingType } from '@app/classes/communication/action-data';
import { Tile } from '@app/classes/tile';
import { UserId } from '@app/classes/user/connected-user-types';
import { ScoredWordPlacement } from '@app/classes/word-finding';
import { Board } from '@app/classes/board';
import Player from '@app/classes/player/player';

export interface PlayerAnalysis {
    player: Player;
    analysis: Analysis;
}
export interface Analysis {
    gameId: string;
    userId: UserId;
    criticalMoments: CriticalMoment[];
}

export interface AnalysisData {
    gameId: string;
    userId: UserId;
    analysisId: number;
}

export interface CriticalMomentData {
    criticalMomentId: number;
    actionType: ActionTurnEndingType;
    tiles: string;
    board: string;
    playedPlacementId?: number;
    bestPlacementId: number;
    analysisId: number;
}

export interface PlacementData {
    placementId: number;
    tilesToPlace: string;
    isHorizontal: boolean;
    score: number;
    row: number;
    column: number;
}
export interface CriticalMoment {
    tiles: Tile[];
    actionType: ActionTurnEndingType;
    playedPlacement?: ScoredWordPlacement;
    board: Board;
    // board: (Square | undefined)[];
    bestPlacement: ScoredWordPlacement;
}
