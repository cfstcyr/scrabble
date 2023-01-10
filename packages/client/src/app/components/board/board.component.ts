import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActionType, PlaceActionPayload } from '@app/classes/actions/action-data';
import { Orientation } from '@app/classes/actions/orientation';
import { BoardNavigator } from '@app/classes/board-navigator/board-navigator';
import Direction from '@app/classes/board-navigator/direction';
import { Position } from '@app/classes/board-navigator/position';
import { Vec2 } from '@app/classes/board-navigator/vec2';
import { FocusableComponent } from '@app/classes/focusable-component/focusable-component';
import { Square, SquareView } from '@app/classes/square';
import { LetterValue, Tile } from '@app/classes/tile';
import { CANNOT_REMOVE_UNUSED_TILE } from '@app/constants/component-errors';
import { BACKSPACE, ENTER, ESCAPE, KEYDOWN, NOT_FOUND } from '@app/constants/components-constants';
import { BLANK_TILE_LETTER_VALUE, LETTER_VALUES, MARGIN_COLUMN_SIZE, SQUARE_SIZE, UNDEFINED_SQUARE } from '@app/constants/game-constants';
import { SQUARE_TILE_DEFAULT_FONT_SIZE } from '@app/constants/tile-font-size-constants';
import { BoardService, GameService } from '@app/services/';
import { ActionService } from '@app/services/action-service/action.service';
import { FocusableComponentsService } from '@app/services/focusable-components-service/focusable-components.service';
import { GameViewEventManagerService } from '@app/services/game-view-event-manager-service/game-view-event-manager.service';
import RoundManagerService from '@app/services/round-manager-service/round-manager.service';
import { removeAccents } from '@app/utils/remove-accents/remove-accents';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-board',
    templateUrl: './board.component.html',
    styleUrls: ['./board.component.scss'],
})
export class BoardComponent extends FocusableComponent<KeyboardEvent> implements OnInit, OnDestroy {
    readonly marginColumnSize: number;
    gridSize: Vec2;
    marginLetters: LetterValue[];
    squareGrid: SquareView[][];
    tileFontSize: number;
    selectedSquare: SquareView | undefined;
    navigator: BoardNavigator;

    private notAppliedSquares: SquareView[];
    private newlyPlacedTiles: SquareView[];
    private componentDestroyed$: Subject<boolean>;

    constructor(
        private boardService: BoardService,
        private gameService: GameService,
        private gameViewEventManagerService: GameViewEventManagerService,
        private roundManagerService: RoundManagerService,
        private focusableComponentService: FocusableComponentsService,
        private actionService: ActionService,
    ) {
        super();
        this.marginColumnSize = MARGIN_COLUMN_SIZE;
        this.gridSize = { x: 0, y: 0 };
        this.marginLetters = LETTER_VALUES.slice(0, this.gridSize.x);
        this.squareGrid = [];
        this.notAppliedSquares = [];
        this.tileFontSize = SQUARE_TILE_DEFAULT_FONT_SIZE;
        this.selectedSquare = undefined;
        this.newlyPlacedTiles = [];
        this.componentDestroyed$ = new Subject<boolean>();
    }

    ngOnInit(): void {
        this.boardService.subscribeToInitializeBoard(this.componentDestroyed$, (board: Square[][]) => this.initializeBoard(board));
        this.boardService.subscribeToBoardUpdate(this.componentDestroyed$, (squaresToUpdate: Square[]) => this.updateBoard(squaresToUpdate));
        this.gameViewEventManagerService.subscribeToGameViewEvent('usedTiles', this.componentDestroyed$, (payload) => this.handlePlaceTiles(payload));
        this.roundManagerService.subscribeToEndRoundEvent(this.componentDestroyed$, () => this.clearCursor());

        if (!this.boardService.readInitialBoard()) return;
        this.initializeBoard(this.boardService.readInitialBoard());
        this.subscribeToFocusableEvents();
    }

    ngOnDestroy(): void {
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.complete();
        this.unsubscribeToFocusableEvents();
    }

    onSquareClick(squareView: SquareView): boolean {
        this.focusableComponentService.setActiveKeyboardComponent(this);

        if (squareView.square.tile !== null) return false;
        if (!this.gameService.isLocalPlayerPlaying()) return false;
        if (this.actionService.hasActionBeenPlayed) {
            this.clearCursor();
            return false;
        }

        if (this.selectedSquare === squareView && this.notAppliedSquares.length === 0) {
            this.navigator.switchOrientation();
        } else {
            this.selectedSquare = squareView;
            this.navigator.orientation = Orientation.Horizontal;
            this.navigator.setPosition(squareView.square.position);
        }

        this.gameViewEventManagerService.emitGameViewEvent('resetUsedTiles');

        return true;
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

    protected onFocusableEvent(event: KeyboardEvent): void {
        switch (event.key) {
            case BACKSPACE:
                if (event.type === KEYDOWN) this.handleBackspace();
                break;
            case ESCAPE:
                if (event.type === KEYDOWN) this.clearCursor();
                break;
            case ENTER:
                this.handleEnter();
                break;
            default:
                this.handlePlaceLetter(event.key, event.shiftKey, this.selectedSquare);
        }
    }

    protected onLoseFocusEvent(): void {
        this.clearCursor();
    }

    private handlePlaceLetter(letter: string, isUppercase: boolean, squareView: SquareView | undefined): void {
        if (!this.canPlace(squareView)) return;

        letter = removeAccents(letter.toUpperCase());

        if (!(LETTER_VALUES as string[]).includes(letter)) return;
        if (letter === BLANK_TILE_LETTER_VALUE) return;

        const availableTiles = [...(this.gameService.getLocalPlayer()?.getTiles() ?? [])];
        const usedTiles = [...(this.gameViewEventManagerService.getGameViewEventValue('usedTiles')?.tiles ?? [])];

        for (const usedTile of usedTiles) {
            const index = availableTiles.findIndex((t) => t.letter === usedTile.letter);
            if (index >= 0) availableTiles.splice(index, 1);
        }

        let tile: Tile | undefined;

        if (isUppercase) {
            tile = availableTiles.find((t) => t.isBlank);
            if (tile) (tile.playedLetter as string) = letter;
        } else {
            tile = availableTiles.find((t) => t.letter === letter);
        }

        if (!tile) return;

        this.useTile(tile);

        const nextNavigator = this.navigator.clone();
        if (nextNavigator.nextEmpty(Direction.Forward, false)) {
            this.navigator = nextNavigator;
            this.selectedSquare = nextNavigator.currentSquareView;
        }
    }

    private canPlace(squareView: SquareView | undefined): boolean {
        return squareView !== undefined && !this.actionService.hasActionBeenPlayed && !squareView.square.tile;
    }

    private handleBackspace(): void {
        if (!this.canBackspace()) return;

        let index = this.notAppliedSquares.indexOf(this.navigator.currentSquareView);

        if (index === NOT_FOUND) {
            this.selectedSquare = this.navigator.nextEmpty(Direction.Backward, true);
            if (this.selectedSquare) index = this.notAppliedSquares.indexOf(this.selectedSquare);
        }

        if (index !== NOT_FOUND) {
            this.notAppliedSquares.splice(index, 1);
        }
        if (this.selectedSquare) {
            const selectedTile: Tile | null = this.selectedSquare.square.tile;
            if (selectedTile) {
                this.removeUsedTile(selectedTile);
            }
            this.selectedSquare.square.tile = null;
        }
    }

    private canBackspace(): boolean {
        return this.selectedSquare !== undefined && this.areTilesUsed() && !this.actionService.hasActionBeenPlayed;
    }

    private handleEnter(): void {
        const placePayload: PlaceActionPayload | undefined = this.gameViewEventManagerService.getGameViewEventValue('usedTiles');
        if (!placePayload) return;
        this.actionService.sendAction(
            this.gameService.getGameId(),
            this.gameService.getLocalPlayerId(),
            this.actionService.createActionData(ActionType.PLACE, placePayload),
        );
        this.clearCursor();
    }

    private clearCursor(): void {
        this.selectedSquare = undefined;
        if (!this.actionService.hasActionBeenPlayed) this.gameViewEventManagerService.emitGameViewEvent('resetUsedTiles');
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
    }

    private getSquare(board: Square[][], row: number, column: number): Square {
        return board[row] && board[row][column] ? board[row][column] : UNDEFINED_SQUARE;
    }

    private updateBoard(squaresToUpdate: Square[]): boolean {
        if (this.hasBoardBeenUpdated(squaresToUpdate)) return false;
        this.gameViewEventManagerService.emitGameViewEvent('resetUsedTiles');
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

                    this.newlyPlacedTiles.push(squareView);
                });
        });
        this.selectedSquare = undefined;
        return true;
    }

    private hasBoardBeenUpdated(squaresToUpdate: Square[]): boolean {
        return !squaresToUpdate || squaresToUpdate.length <= 0 || squaresToUpdate.length > this.gridSize.x * this.gridSize.y;
    }

    private isInBounds(position: Position): boolean {
        return position.row < this.squareGrid.length && position.column < this.squareGrid[position.row].length;
    }

    private handlePlaceTiles(payload: PlaceActionPayload | undefined): void {
        if (!payload) {
            this.notAppliedSquares.forEach((squareView: SquareView) => (squareView.square.tile = null));
            this.notAppliedSquares = [];
            return;
        }

        const position = { ...payload.startPosition };
        const next = () => (payload.orientation === Orientation.Horizontal ? position.column++ : position.row++);
        this.notAppliedSquares = [];

        for (let i = 0; i < payload.tiles.length; ) {
            if (!this.isInBounds(position)) return;

            const squareView = this.squareGrid[position.row][position.column];

            if (!squareView.square.tile || !squareView.applied) {
                squareView.square.tile = { ...payload.tiles[i] };
                squareView.applied = false;
                this.notAppliedSquares.push(squareView);
                i++;
            } else if (i === 0) {
                return;
            }

            next();
        }
    }

    private useTile(tile: Tile): void {
        const previousUsedTiles = this.gameViewEventManagerService.getGameViewEventValue('usedTiles');

        if (previousUsedTiles) {
            this.gameViewEventManagerService.emitGameViewEvent('usedTiles', {
                ...previousUsedTiles,
                tiles: [...previousUsedTiles.tiles, tile],
            });
        } else {
            this.gameViewEventManagerService.emitGameViewEvent('usedTiles', {
                orientation: this.navigator.orientation,
                startPosition: { row: this.navigator.row, column: this.navigator.column },
                tiles: [tile],
            });
        }
    }

    private removeUsedTile(tile: Tile): void {
        const previousUsedTiles = this.gameViewEventManagerService.getGameViewEventValue('usedTiles');

        if (!previousUsedTiles) throw new Error(CANNOT_REMOVE_UNUSED_TILE);
        if (previousUsedTiles.tiles.length <= 1) {
            this.gameViewEventManagerService.emitGameViewEvent('resetUsedTiles');
            return;
        }

        const index = previousUsedTiles.tiles.map((t: Tile) => t.letter).lastIndexOf(tile.letter);

        if (index === NOT_FOUND) throw new Error(CANNOT_REMOVE_UNUSED_TILE);

        previousUsedTiles.tiles.splice(index, 1);
        this.gameViewEventManagerService.emitGameViewEvent('usedTiles', { ...previousUsedTiles });
    }

    private areTilesUsed(): boolean {
        const usedTiles: PlaceActionPayload | undefined = this.gameViewEventManagerService.getGameViewEventValue('usedTiles');
        return usedTiles !== undefined && usedTiles.tiles.length > 0;
    }
}
