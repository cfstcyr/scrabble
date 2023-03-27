import { Tile, Square } from "./game";
import { ScoredWordPlacement } from "./word-finding";
import { ActionType } from './action';
import { TypeOfId } from "../types/id";
import { User } from "./user";
import { GameHistory } from "./game-history";

export interface CriticalMomentBase {
    tiles: Tile[];
    actionType: ActionType;
    playedPlacement?: ScoredWordPlacement;
    bestPlacement: ScoredWordPlacement;
}

export interface CriticalMomentResponse extends CriticalMomentBase {
    filledSquares: Square[];
}

export interface AnalysisResponse {
    idGame: TypeOfId<GameHistory>;
    idUser: TypeOfId<User>;
    criticalMoments: CriticalMomentResponse[];
}
