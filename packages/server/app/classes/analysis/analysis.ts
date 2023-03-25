import { UserId } from '@app/classes/user/connected-user-types';
import { Board } from '@app/classes/board';
import Player from '@app/classes/player/player';
import { ActionType } from '@common/models/action';
import { AnalysisResponse, CriticalMomentBase } from '@common/models/analysis';
import { TypeOfId } from '@common/types/id';
import { GameHistory } from '@common/models/game-history';

export interface PlayerAnalysis {
    player: Player;
    analysis: Analysis;
}
export interface Analysis extends Omit<AnalysisResponse, 'criticalMoments'> {
    criticalMoments: CriticalMoment[];
}

export interface AnalysisData {
    idGame: TypeOfId<GameHistory>;
    idUser: UserId;
    idAnalysis: number;
}

export interface CriticalMomentData {
    idCriticalMoment: number;
    actionType: ActionType;
    tiles: string;
    board: string;
    idPlayedPlacement?: TypeOfId<PlacementData>;
    idBestPlacement: TypeOfId<PlacementData>;
    idAnalysis: TypeOfId<AnalysisData>;
}

export interface PlacementData {
    idPlacement: number;
    tilesToPlace: string;
    isHorizontal: boolean;
    score: number;
    row: number;
    column: number;
}
export interface CriticalMoment extends CriticalMomentBase {
    board: Board;
}
