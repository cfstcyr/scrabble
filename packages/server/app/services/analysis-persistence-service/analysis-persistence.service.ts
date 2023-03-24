/* eslint-disable @typescript-eslint/naming-convention */
import { UserId } from '@app/classes/user/connected-user-types';
import { ANALYSIS_TABLE, CRITICAL_MOMENTS_TABLE, PLACEMENT_TABLE } from '@app/constants/services-constants/database-const';
import { Service } from 'typedi';
import DatabaseService from '@app/services/database-service/database.service';
import { Analysis, AnalysisData, AnalysisResponse, CriticalMomentData, CriticalMomentResponse, PlacementData } from '@app/classes/analysis/analysis';
import { ScoredWordPlacement } from '@app/classes/word-finding';
import { Board, Orientation, Position } from '@app/classes/board';
import { Tile, TileReserve } from '@app/classes/tile';
import BoardService from '@app/services/board-service/board.service';
import { HttpException } from '@app/classes/http-exception/http-exception';
import { NO_ANALYSIS_FOUND } from '@app/constants/services-errors';
import { StatusCodes } from 'http-status-codes';
import { ActionTurnEndingType } from '@common/models/analysis';

@Service()
export class AnalysisPersistenceService {
    constructor(private readonly databaseService: DatabaseService, private boardService: BoardService) {}

    async requestAnalysis(gameId: string, userId: UserId): Promise<AnalysisResponse> {
        if (!(await this.doesMatchingAnalysisExist(gameId, userId))) throw new HttpException(NO_ANALYSIS_FOUND, StatusCodes.NOT_FOUND);

        const analysisData = await this.analysisTable
            .select(
                `${CRITICAL_MOMENTS_TABLE}.*`,
                'bp.score as bp_score',
                'bp.tilesToPlace as bp_tilesToPlace',
                'bp.isHorizontal as bp_isHorizontal',
                'bp.row as bp_row',
                'bp.column as bp_column',
                'pp.score as pp_score',
                'pp.tilesToPlace as pp_tilesToPlace',
                'pp.isHorizontal as pp_isHorizontal',
                'pp.row as pp_row',
                'pp.column as pp_column',
            )
            .join(CRITICAL_MOMENTS_TABLE, `${ANALYSIS_TABLE}.analysisId`, '=', `${CRITICAL_MOMENTS_TABLE}.analysisId`)
            .join(PLACEMENT_TABLE + ' as bp', `${CRITICAL_MOMENTS_TABLE}.bestPlacementId`, '=', 'bp.placementId')
            .leftJoin(PLACEMENT_TABLE + ' as pp', `${CRITICAL_MOMENTS_TABLE}.playedPlacementId`, '=', 'pp.placementId')
            .where({
                'Analysis.gameId': gameId,
                'Analysis.userId': userId,
            });
        const analysis: AnalysisResponse = { gameId, userId, criticalMoments: [] };
        for (const criticalMomentData of analysisData) {
            analysis.criticalMoments.push(await this.convertDataToCriticalMoment(criticalMomentData));
        }
        return analysis;
    }

    async doesMatchingAnalysisExist(gameId: string, userId: UserId): Promise<boolean> {
        const analysisData = await this.analysisTable.select('*').where({ gameId, userId }).limit(1);
        return analysisData.length > 0;
    }

    async addAnalysis(gameId: string, userId: UserId, analysis: Analysis) {
        const insertedValue = await this.analysisTable.insert({ gameId, userId }).returning('analysisId');

        for (const criticalMoment of analysis.criticalMoments) {
            const bestPlacementId = await this.addPlacement(criticalMoment.bestPlacement);
            let playedPlacementId;
            if (criticalMoment.playedPlacement) playedPlacementId = await this.addPlacement(criticalMoment.playedPlacement);

            await this.criticalMomentTable.insert({
                actionType: criticalMoment.actionType,
                tiles: criticalMoment.tiles.map((tile) => this.convertTileToString(tile)).join(''),
                board: this.convertBoardToString(criticalMoment.board),
                playedPlacementId,
                bestPlacementId,
                analysisId: insertedValue[0].analysisId,
            });
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private async convertDataToCriticalMoment(criticalMomentData: any): Promise<CriticalMomentResponse> {
        const tilePromises = criticalMomentData.tiles.split('').map(async (tileString: string) => TileReserve.convertStringToTile(tileString));
        return {
            tiles: await Promise.all(tilePromises),
            actionType: criticalMomentData.actionType as ActionTurnEndingType,
            filledSquares: await this.boardService.initializeBoardSquares(criticalMomentData.board),
            bestPlacement: await this.convertDataToPlacement({
                tilesToPlace: criticalMomentData.bp_tilesToPlace,
                isHorizontal: criticalMomentData.bp_isHorizontal,
                score: criticalMomentData.bp_score,
                row: criticalMomentData.bp_row,
                column: criticalMomentData.bp_column,
            }),
            playedPlacement:
                (criticalMomentData.actionType as ActionTurnEndingType) === ActionTurnEndingType.PLACE
                    ? await this.convertDataToPlacement({
                          tilesToPlace: criticalMomentData.pp_tilesToPlace,
                          isHorizontal: criticalMomentData.pp_isHorizontal,
                          score: criticalMomentData.pp_score,
                          row: criticalMomentData.pp_row,
                          column: criticalMomentData.pp_column,
                      })
                    : undefined,
        };
    }
    private async convertDataToPlacement(placementData: Omit<PlacementData, 'placementId'>): Promise<ScoredWordPlacement> {
        const tilePromises = placementData.tilesToPlace.split('').map(async (tileString) => TileReserve.convertStringToTile(tileString));
        const tiles = await Promise.all(tilePromises);
        return {
            tilesToPlace: tiles,
            orientation: placementData.isHorizontal ? Orientation.Horizontal : Orientation.Vertical,
            startPosition: new Position(placementData.row, placementData.column),
            score: placementData.score,
        };
    }

    private async addPlacement(placement: ScoredWordPlacement): Promise<number> {
        const insertedValue = await this.placementTable
            .insert({
                tilesToPlace: placement.tilesToPlace.map((tile) => this.convertTileToString(tile)).join(''),
                isHorizontal: placement.orientation === Orientation.Horizontal,
                score: placement.score,
                row: placement.startPosition.row,
                column: placement.startPosition.column,
            })
            .returning('placementId');
        return insertedValue[0].placementId;
    }

    private convertTileToString(tile: Tile): string {
        if (tile.isBlank) {
            if (tile.playedLetter) {
                return tile.playedLetter.toLowerCase();
            } else {
                return tile.letter.toLowerCase();
            }
        } else {
            return tile.letter;
        }
    }

    private convertBoardToString(board: Board): string {
        let outputString = '';
        for (const row of board.grid) {
            for (const square of row) {
                if (!square.tile) {
                    outputString += ' ';
                } else {
                    outputString += this.convertTileToString(square.tile);
                }
            }
        }
        return outputString;
    }

    private get analysisTable() {
        return this.databaseService.knex<AnalysisData>(ANALYSIS_TABLE);
    }

    private get criticalMomentTable() {
        return this.databaseService.knex<CriticalMomentData>(CRITICAL_MOMENTS_TABLE);
    }

    private get placementTable() {
        return this.databaseService.knex<PlacementData>(PLACEMENT_TABLE);
    }
}
