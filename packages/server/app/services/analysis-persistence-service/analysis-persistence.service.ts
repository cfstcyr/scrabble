import { UserId } from '@app/classes/user/connected-user-types';
import { ANALYSIS_TABLE } from '@app/constants/services-constants/database-const';
import { Service } from 'typedi';
import DatabaseService from '@app/services/database-service/database.service';
import { Board } from '@app/classes/board';
import { Square } from '@app/classes/square';
import BoardService from '../board-service/board.service';
import { Analysis } from '@app/classes/analysis/analysis';

@Service()
export class AnalysisPersistenceService {
    constructor(private readonly databaseService: DatabaseService, private boardService: BoardService) {}

    async requestAnalysis(gameId: string, userId: UserId) {
        return this.analysisTable.select('*').where({ gameId, userId });
    }

    async addAnalysis(gameId: string, userId: UserId, analysis: Analysis) {
        // return this.analysisTable.select('*').where({ gameId, userId });
    }

    private convertBoardToString(board: Board): string {
        let outputString = '';
        for (const row of board.grid) {
            for (const square of row) {
                if (!square.tile) {
                    outputString += ' ';
                } else if (square.tile.isBlank) {
                    if (square.tile.playedLetter) {
                        outputString += square.tile.playedLetter.toLowerCase();
                    } else {
                        outputString += square.tile.letter.toLowerCase();
                    }
                } else {
                    outputString += square.tile.letter;
                }
            }
        }
        return outputString;
    }

    private convertStringToSquares(boardString: string) {
        this.boardService.initializeBoardSquares(boardString)

        // for (let i = 0; i < 15; i++) {
        //     for (let j = 0; j < 15; j++) {
        //         bo
        //     }
        // }
    }

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
        return this.databaseService.knex<AnalysisPersistenceService>(ANALYSIS_TABLE);
    }
}
