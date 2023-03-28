import { Injectable } from '@angular/core';
import { Position } from '@app/classes/board-navigator/position';
import { Orientation } from '@common/models/position';
import { SquareView } from '@app/classes/square';
import { TilePlacementService } from '@app/services/tile-placement-service/tile-placement.service';
import { comparePositions } from '@app/utils/comparator/comparator';
import { BoardNavigator } from '@app/classes/board-navigator/board-navigator';
import { LetterValue, Tile } from '@app/classes/tile';
import { BehaviorSubject } from 'rxjs';

const BOARD_CURSOR_NOT_INITIALIZED = 'Board cursor service not initialized';

@Injectable({
    providedIn: 'root',
})
export class BoardCursorService {
    private grid: BehaviorSubject<SquareView[][]> | undefined;
    private getUserTiles: (() => Tile[]) | undefined;
    private notAppliedSquares: SquareView[] | undefined;
    private cursor: BoardNavigator | undefined;

    constructor(private readonly tilePlacementService: TilePlacementService) {}

    initialize(grid: BehaviorSubject<SquareView[][]>, getUserTiles: (() => Tile[]) | undefined): void {
        this.grid = grid;
        this.updateTiles(getUserTiles);
        this.notAppliedSquares = [];
    }

    updateTiles(getUserTiles: (() => Tile[]) | undefined): void {
        this.getUserTiles = getUserTiles;
    }

    handleSquareClick(squareView: SquareView): void {
        this.tilePlacementService.resetTiles();
        this.setCursor(squareView.square.position);
    }

    clear(): void {
        this.clearCurrentSquare();
        this.cursor = undefined;
        this.tilePlacementService.resetTiles();
    }

    handleLetter(letter: string, isHoldingShift: boolean): void {
        if (!this.notAppliedSquares) throw new Error(BOARD_CURSOR_NOT_INITIALIZED);
        if (!this.getUserTiles) throw new Error(BOARD_CURSOR_NOT_INITIALIZED);

        if (!this.cursor) return;

        const square = this.cursor.currentSquareView;
        if (!square) return;

        if (square.square.tile) {
            this.cursor.forward();
            this.handleLetter(letter, isHoldingShift);
            return;
        }

        const tile = this.getAvailableTiles().find((t) => (isHoldingShift ? t.isBlank : t.letter.toLowerCase() === letter.toLowerCase()));
        if (!tile) return;

        if (isHoldingShift) tile.playedLetter = letter.toUpperCase() as LetterValue;

        this.tilePlacementService.placeTile(
            {
                tile,
                position: { ...this.cursor.getPosition() },
            },
            true,
        );
        this.notAppliedSquares.push(square);

        this.clearCurrentSquare();
        do {
            this.cursor.forward();
        } while (this.cursor.currentSquareView.square.tile);
        this.setCurrentCursorSquare();
    }

    handleBackspace(): void {
        if (!this.notAppliedSquares) throw new Error(BOARD_CURSOR_NOT_INITIALIZED);
        if (!this.cursor) return;

        if (!this.cursor.clone().backward().isWithinBounds()) return;

        this.clearCurrentSquare();
        do {
            this.cursor.backward();
        } while (this.cursor.currentSquareView.applied && this.cursor.currentSquareView.square.tile && this.cursor.isWithinBounds());
        this.setCurrentCursorSquare();

        const square = this.cursor.currentSquareView;
        if (!square) return;

        if (square.square.tile) {
            this.tilePlacementService.removeTile({
                tile: square.square.tile,
                position: { ...this.cursor.getPosition() },
            });
            this.notAppliedSquares.pop();
        }
    }

    private setCursor(position: Position): void {
        if (!this.grid) throw new Error(BOARD_CURSOR_NOT_INITIALIZED);

        if (this.cursor && comparePositions(this.cursor.getPosition(), position)) {
            this.cursor.switchOrientation();
        } else {
            this.clear();
            this.clearCurrentSquare();
            this.cursor = new BoardNavigator(this.grid.value, position, Orientation.Horizontal);
        }

        this.setCurrentCursorSquare();
    }

    private getCursorSquare(): SquareView | undefined {
        return this.cursor?.currentSquareView;
    }

    private getAvailableTiles(): Tile[] {
        if (!this.getUserTiles) throw new Error(BOARD_CURSOR_NOT_INITIALIZED);
        const placed = [...this.tilePlacementService.tilePlacements.map((placement) => placement.tile)];
        return this.getUserTiles().filter((tile) => {
            const index = placed.indexOf(tile);

            if (index >= 0) {
                placed.splice(index, 1);
                return false;
            }

            return true;
        });
    }

    private clearSquare(square: SquareView | undefined): void {
        if (square) {
            square.isCursor = false;
            square.cursorOrientation = undefined;
        }
    }

    private setCursorSquare(square: SquareView | undefined): void {
        if (square) {
            square.isCursor = true;
            square.cursorOrientation = this.cursor?.orientation;
        }
    }

    private clearCurrentSquare(): void {
        this.clearSquare(this.getCursorSquare());
    }

    private setCurrentCursorSquare(): void {
        this.setCursorSquare(this.getCursorSquare());
    }
}
