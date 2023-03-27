import { Component, Input, OnInit } from '@angular/core';
import { BoardNavigator } from '@app/classes/board-navigator/board-navigator';
import { Square, SquareView } from '@app/classes/square';
import { TilePlacement } from '@app/classes/tile';
import { SQUARE_SIZE, UNDEFINED_SQUARE } from '@app/constants/game-constants';
import { BoardService, GameService } from '@app/services';
import { TilePlacementService } from '@app/services/tile-placement-service/tile-placement.service';
import { Orientation } from '@common/models/position';
import { BehaviorSubject, of } from 'rxjs';

@Component({
    selector: 'app-game-board-wrapper',
    templateUrl: './game-board-wrapper.component.html',
    styleUrls: ['./game-board-wrapper.component.scss'],
})
export class GameBoardWrapperComponent implements OnInit {
    @Input() isObserver: boolean;
    grid: BehaviorSubject<SquareView[][]> = new BehaviorSubject<SquareView[][]>([]);

    private notAppliedSquares: SquareView[] = [];
    private newlyPlacedTiles: SquareView[] = [];
    private opponentPlacedTiles: SquareView[] = [];

    constructor(readonly boardService: BoardService, readonly tilePlacementService: TilePlacementService, readonly gameService: GameService) {}

    ngOnInit(): void {
        this.boardService.subscribeToInitializeBoard(of(), this.initializeBoard.bind(this));
        this.boardService.subscribeToBoardUpdate(of(), this.handleUpdateBoard.bind(this));
        this.tilePlacementService.tilePlacements$.subscribe(this.handlePlaceTiles.bind(this));
        this.boardService.subscribeToTemporaryTilePlacements(this.handleOpponentPlaceTiles.bind(this));

        if (!this.boardService.readInitialBoard()) return;
        this.initializeBoard(this.boardService.readInitialBoard());
    }

    resetNotAppliedSquares(): void {
        this.tilePlacementService.resetTiles();
    }

    clearNewlyPlacedTiles(): void {
        this.newlyPlacedTiles.forEach((squareView) => (squareView.newlyPlaced = false));
        this.newlyPlacedTiles = [];
    }

    private initializeBoard(board: Square[][]): void {
        const grid = this.grid.value;

        for (let i = 0; i < board.length; i++) {
            grid[i] = [];

            for (let j = 0; j < board[i].length; j++) {
                const square: Square = this.getSquare(board, i, j);
                grid[i][j] = new SquareView(square, SQUARE_SIZE);
            }
        }

        this.boardService.navigator = new BoardNavigator(grid, { row: 0, column: 0 }, Orientation.Horizontal);
        this.grid.next(grid);
    }

    private handleUpdateBoard(squaresToUpdate: Square[]): void {
        this.clearNewlyPlacedTiles();
        this.tilePlacementService.resetTiles();

        const grid = this.grid.value;

        for (const square of squaresToUpdate) {
            const squareView = grid[square.position.row][square.position.column];

            squareView.square = square;
            squareView.applied = true;
            squareView.newlyPlaced = true;

            this.newlyPlacedTiles.push(squareView);
        }

        this.grid.next(grid);
    }

    private handlePlaceTiles(tilePlacements: TilePlacement[]): void {
        this.clearNotAppliedSquares();

        const grid = this.grid.value;

        for (const tilePlacement of tilePlacements) {
            const squareView = grid[tilePlacement.position.row][tilePlacement.position.column];

            if (!squareView.square.tile || !squareView.applied) {
                squareView.square.tile = tilePlacement.tile;
                squareView.applied = false;
                this.notAppliedSquares.push(squareView);
            }
        }

        this.grid.next(grid);
    }

    private handleOpponentPlaceTiles(tilePlacements: TilePlacement[]): void {
        this.opponentPlacedTiles.forEach((squareView: SquareView) => {
            squareView.square.tile = null;
            squareView.halfOppacity = false;
        });
        this.opponentPlacedTiles = [];

        const grid = this.grid.value;

        for (const tilePlacement of tilePlacements) {
            const squareView = grid[tilePlacement.position.row][tilePlacement.position.column];

            if (!squareView.square.tile) {
                squareView.square.tile = tilePlacement.tile;
                squareView.halfOppacity = true;
                this.opponentPlacedTiles.push(squareView);
            }
        }

        this.grid.next(grid);
    }

    private clearNotAppliedSquares(): void {
        this.notAppliedSquares.forEach((squareView) => (squareView.square.tile = null));
        this.notAppliedSquares = [];
    }

    private getSquare(board: Square[][], row: number, column: number): Square {
        return board[row] && board[row][column] ? board[row][column] : UNDEFINED_SQUARE;
    }
}
