import { Tile, Square } from "./game";
import { ScoredWordPlacement } from "./word-finding";

export interface CriticalMomentResponse {
    tiles: Tile[];
    actionType: ActionTurnEndingType;
    playedPlacement?: ScoredWordPlacement;
    filledSquares: Square[];
    bestPlacement: ScoredWordPlacement;
}

export interface AnalysisResponse {
    gameId: string;
    userId: number;
    criticalMoments: CriticalMomentResponse[];
}

export enum ActionTurnEndingType {
    PLACE = 'placer',
    EXCHANGE = 'échanger',
    PASS = 'passer',
}