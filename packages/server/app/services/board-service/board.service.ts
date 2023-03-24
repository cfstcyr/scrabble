import { Board, Position } from '@app/classes/board';
import { Vec2 } from '@app/classes/board/vec2';
import { HttpException } from '@app/classes/http-exception/http-exception';
import { Square } from '@app/classes/square';
import { Multiplier } from '@app/classes/square/square';
import { Tile } from '@app/classes/tile';
import { BOARD_CONFIG, BOARD_CONFIG_MAP } from '@app/constants/board-config';
import { BOARD_SIZE } from '@app/constants/game-constants';
import { BOARD_CONFIG_UNDEFINED_AT, NO_MULTIPLIER_MAPPED_TO_INPUT } from '@app/constants/services-errors';
import { StringConversion } from '@app/utils/string-conversion/string-conversion';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export default class BoardService {
    private static readonly size: Vec2 = { x: BOARD_SIZE.x, y: BOARD_SIZE.y };

    initializeBoard(): Board {
        const grid: Square[][] = [];
        const center: Position = new Position(Math.floor(BoardService.size.x / 2), Math.floor(BoardService.size.y / 2));
        for (let i = 0; i < BoardService.size.y; i++) {
            grid[i] = [];
            for (let j = 0; j < BoardService.size.x; j++) {
                const isCenter = j === center.row && i === center.column;
                const square: Square = {
                    tile: null,
                    position: new Position(i, j),
                    scoreMultiplier: this.readScoreMultiplierConfig(new Position(i, j)),
                    wasMultiplierUsed: false,
                    isCenter,
                };
                grid[i][j] = square;
            }
        }
        return new Board(grid);
    }

    initializeBoardSquares(boardString: string): Square[] {
        const center: Position = new Position(Math.floor(BoardService.size.x / 2), Math.floor(BoardService.size.y / 2));
        const filledSquares: Square[] = [];
        for (let i = 0; i < boardString.length; i++) {
            // check if this is the correct position
            const position = new Position(Math.floor(i / BoardService.size.y), i % BoardService.size.x);
            let tile: Tile;
            if (boardString[i] === ' ') continue;
            else {
                tile = StringConversion.convertStringToTile(boardString[i]);
            }
            const isCenter = position.row === center.row && position.column === center.column;
            const square: Square = {
                tile,
                position,
                scoreMultiplier: this.readScoreMultiplierConfig(position),
                wasMultiplierUsed: true,
                isCenter,
            };
            filledSquares.push(square);
        }
        return filledSquares;
    }

    private readScoreMultiplierConfig(position: Position): Multiplier {
        if (!this.isBoardConfigDefined(position)) throw new HttpException(BOARD_CONFIG_UNDEFINED_AT(position), StatusCodes.BAD_REQUEST);
        return this.parseSquareConfig(BOARD_CONFIG[position.row][position.column]);
    }

    private parseSquareConfig(data: string): Multiplier {
        if (BOARD_CONFIG_MAP.get(data) === undefined) {
            throw new HttpException(NO_MULTIPLIER_MAPPED_TO_INPUT(data), StatusCodes.BAD_REQUEST);
        }
        return BOARD_CONFIG_MAP.get(data) as Multiplier;
    }

    private isBoardConfigDefined(position: Position): boolean {
        return (
            BOARD_CONFIG &&
            BOARD_CONFIG[0] &&
            BOARD_CONFIG.length > position.row &&
            BOARD_CONFIG[0].length > position.column &&
            position.row >= 0 &&
            position.column >= 0
        );
    }
}
