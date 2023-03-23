/* eslint-disable @typescript-eslint/naming-convention */
import { UserId } from '@app/classes/user/connected-user-types';
import { ANALYSIS_TABLE, CRITICAL_MOMENTS_TABLE, PLACEMENT_TABLE } from '@app/constants/services-constants/database-const';
import { Service } from 'typedi';
import DatabaseService from '@app/services/database-service/database.service';
// import { Board } from '@app/classes/board';
import { Analysis, AnalysisData, CriticalMomentData, CriticalMomentResponse, PlacementData } from '@app/classes/analysis/analysis';
import { ScoredWordPlacement } from '@app/classes/word-finding';
import { Board, Orientation } from '@app/classes/board';
import { Tile, TileReserve } from '@app/classes/tile';
import { ActionTurnEndingType } from '@app/classes/communication/action-data';
import BoardService from '../board-service/board.service';
// import BoardService from '@app/services/board-service/board.service';

@Service()
export class AnalysisPersistenceService {
    constructor(private readonly databaseService: DatabaseService, private boardService: BoardService) {}

    async requestAnalysis(gameId: string, userId: UserId) {
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

        const analysis: Analysis = { gameId, userId, criticalMoments: [] };
        for (const criticalMomentData of analysisData) {
            const criticalMoment: CriticalMomentResponse = {tiles: criticalMomentData.tiles.map(async (tileString: string) => await TileReserve.convertStringToTile(tileString)), 
                actionType: criticalMomentData.actionType as ActionTurnEndingType,
                filledSquares: await this.boardService.initializeBoardSquares(criticalMomentData.board),
                bestPlacement: this.convertDataToPlacement
                playedPlacement: 
            }
            playedPlacement?: ScoredWordPlacement;
            bestPlacement: ScoredWordPlacement;
        }
    }

    private convertDataToPlacement()

    async addAnalysis(gameId: string, userId: UserId, analysis: Analysis) {
        console.log('-------------------START-----------------------');
        console.log(`ANALYSIS OF GAME: ${gameId} FOR ${userId}`);
        console.log(`Critical moments length: ${analysis.criticalMoments.length}`);
        for (const criticalMoment of analysis.criticalMoments) {
            console.log(`   actionType: ${criticalMoment.actionType}`);
            console.log(`   tiles: ${criticalMoment.tiles.map((tile) => tile.letter).join('')}`);
            console.log(`   boardgrid[7]: ${criticalMoment.board.grid[7].map((square) => square.tile?.letter ?? ' ').join('')}`);
        }

        console.log('------------------END------------------------');

        // return this.analysisTable.select('*').where({ gameId, userId });

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

    private convertStringToTile(tile: Tile): string {
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

    // private convertStringToSquares(boardString: string) {
    //     this.boardService.initializeBoardSquares(boardString);

    //     // for (let i = 0; i < 15; i++) {
    //     //     for (let j = 0; j < 15; j++) {
    //     //         bo
    //     //     }
    //     // }
    // }

    // const boardFromLetterValues = (letterValues: LetterValues) => {
    //     const grid: Square[][] = [];

    //     letterValues.forEach((line, row) => {
    //         const boardRow: Square[] = [];

    //         line.forEach((letter, column) => {
    //             boardRow.push({
    //                 tile: letter === ' ' ? null : { letter: letter as LetterValue, value: 0 },
    //                 position: new Position(row, column),
    //                 scoreMultiplier: null,
    //                 wasMultiplierUsed: false,
    //                 isCenter: false,
    //             });
    //         });

    //         grid.push(boardRow);
    //     });

    //     return new Board(grid);
    // };
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
