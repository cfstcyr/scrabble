import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Orientation } from '@app/classes/actions/orientation';
import { BoardNavigator } from '@app/classes/board-navigator/board-navigator';
import { Vec2 } from '@app/classes/board-navigator/vec2';
import { Square, SquareView } from '@app/classes/square';
import { LetterValue, TilePlacement } from '@app/classes/tile';
import { LETTER_VALUES, MARGIN_COLUMN_SIZE, SQUARE_SIZE, UNDEFINED_SQUARE } from '@app/constants/game-constants';
import { SQUARE_TILE_DEFAULT_FONT_SIZE } from '@app/constants/tile-font-size-constants';
import { BoardService } from '@app/services/';
import { TilePlacementService } from '@app/services/tile-placement-service/tile-placement.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-board',
    templateUrl: './board.component.html',
    styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit, OnDestroy {
    @Input() isObserver: boolean;
    gridSize: Vec2;
    marginLetters: LetterValue[];
    squareGrid: SquareView[][];
    tileFontSize: number;
    selectedSquare: SquareView | undefined;
    navigator: BoardNavigator;
    marginColumnSize: number;

    private notAppliedSquares: SquareView[];
    private newlyPlacedTiles: SquareView[];
    private opponentPlacedTiles: SquareView[];
    private componentDestroyed$: Subject<boolean>;

    constructor(private boardService: BoardService, private tilePlacementService: TilePlacementService) {
        this.marginColumnSize = MARGIN_COLUMN_SIZE;
        this.gridSize = { x: 0, y: 0 };
        this.marginLetters = LETTER_VALUES.slice(0, this.gridSize.x);
        this.squareGrid = [];
        this.notAppliedSquares = [];
        this.tileFontSize = SQUARE_TILE_DEFAULT_FONT_SIZE;
        this.selectedSquare = undefined;
        this.newlyPlacedTiles = [];
        this.componentDestroyed$ = new Subject<boolean>();
        this.opponentPlacedTiles = [];
    }

    ngOnInit(): void {
        this.boardService.subscribeToInitializeBoard(this.componentDestroyed$, (board: Square[][]) => this.initializeBoard(board));
        this.boardService.subscribeToBoardUpdate(this.componentDestroyed$, (squaresToUpdate: Square[]) => this.updateBoard(squaresToUpdate));
        this.tilePlacementService.tilePlacements$
            .pipe(takeUntil(this.componentDestroyed$))
            .subscribe((tilePlacements) => this.handlePlaceTiles(tilePlacements));
        this.boardService.subscribeToTemporaryTilePlacements(this.componentDestroyed$, (tilePlacements) => this.handleOpponentPlaceTiles(tilePlacements));
        if (!this.boardService.readInitialBoard()) return;
        this.initializeBoard(this.boardService.readInitialBoard());
    }

    ngOnDestroy(): void {
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.complete();
    }

    isSamePosition(square1: SquareView | undefined, square2: SquareView | undefined): boolean {
        return (
            square1 !== undefined &&
            square2 !== undefined &&
            square1.square.position.row === square2.square.position.row &&
            square1.square.position.column === square2.square.position.column
        );
    }

    clearNewlyPlacedTiles(): void {
        this.newlyPlacedTiles.forEach((squareView) => (squareView.newlyPlaced = false));
        this.newlyPlacedTiles = [];
    }

    private initializeBoard(board: Square[][]): void {
        if (!board || !board[0]) {
            this.gridSize = { x: 0, y: 0 };
            return;
        }

        this.gridSize = { x: board[0].length, y: board.length };
        this.squareGrid = [];
        for (let i = 0; i < this.gridSize.y; i++) {
            this.squareGrid[i] = [];
            for (let j = 0; j < this.gridSize.x; j++) {
                const square: Square = this.getSquare(board, i, j);
                const squareView: SquareView = new SquareView(square, SQUARE_SIZE);
                this.squareGrid[i][j] = squareView;
            }
        }
        this.marginLetters = LETTER_VALUES.slice(0, this.gridSize.x);
        this.navigator = new BoardNavigator(this.squareGrid, { row: 0, column: 0 }, Orientation.Horizontal);

        this.boardService.navigator = this.navigator;
    }

    private getSquare(board: Square[][], row: number, column: number): Square {
        return board[row] && board[row][column] ? board[row][column] : UNDEFINED_SQUARE;
    }

    private updateBoard(squaresToUpdate: Square[]): boolean {
        if (this.hasBoardBeenUpdated(squaresToUpdate)) return false;
        this.tilePlacementService.resetTiles();
        this.clearNewlyPlacedTiles();

        /* 
            We flatten the 2D grid so it becomes a 1D array of SquareView
            Then, we check for each SquareView if it's square property's position 
            matches one of the square in "squareToUpdate".
            If so, we change the board's square to be the updated square
        */
        ([] as SquareView[]).concat(...this.squareGrid).forEach((squareView: SquareView) => {
            squaresToUpdate
                .filter(
                    (square: Square) =>
                        square.position.row === squareView.square.position.row && square.position.column === squareView.square.position.column,
                )
                .forEach((sameSquare: Square) => {
                    squareView.square = sameSquare;
                    squareView.applied = true;
                    squareView.newlyPlaced = true;
                    squareView.halfOppacity = false;
                    this.newlyPlacedTiles.push(squareView);
                });
        });
        this.selectedSquare = undefined;
        return true;
    }

    private hasBoardBeenUpdated(squaresToUpdate: Square[]): boolean {
        return !squaresToUpdate || squaresToUpdate.length <= 0 || squaresToUpdate.length > this.gridSize.x * this.gridSize.y;
    }

    private handlePlaceTiles(tilePlacements: TilePlacement[]): void {
        this.notAppliedSquares.forEach((squareView: SquareView) => (squareView.square.tile = null));
        this.notAppliedSquares = [];

        for (const tilePlacement of tilePlacements) {
            const squareView = this.squareGrid[tilePlacement.position.row][tilePlacement.position.column];

            if (!squareView.square.tile || !squareView.applied) {
                squareView.square.tile = tilePlacement.tile;
                squareView.applied = false;
                this.notAppliedSquares.push(squareView);
                squareView.halfOppacity = false;
            }
        }
    }

    private handleOpponentPlaceTiles(tilePlacements: TilePlacement[]): void {
        console.log('handleOpponentPlaceTiles');
        console.log(tilePlacements);
        this.opponentPlacedTiles.forEach((squareView: SquareView) => (squareView.square.tile = null));
        this.opponentPlacedTiles = [];

        for (const tilePlacement of tilePlacements) {
            const squareView = this.squareGrid[tilePlacement.position.row][tilePlacement.position.column];

            if (!squareView.square.tile) {
                squareView.square.tile = tilePlacement.tile;
                this.opponentPlacedTiles.push(squareView);
                squareView.halfOppacity = true;
            }
        }
    }
}
