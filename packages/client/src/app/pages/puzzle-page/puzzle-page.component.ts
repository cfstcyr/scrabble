import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, HostListener, OnInit } from '@angular/core';
import { BoardNavigator } from '@app/classes/board-navigator/board-navigator';
import { Timer } from '@app/classes/round/timer';
import { SquareView } from '@app/classes/square';
import { Tile, TilePlacement } from '@app/classes/tile';
import { SECONDS_TO_MILLISECONDS, SQUARE_SIZE } from '@app/constants/game-constants';
import { BoardService } from '@app/services';
import { DragAndDropService } from '@app/services/drag-and-drop-service/drag-and-drop.service';
import { PuzzleService } from '@app/services/puzzle-service/puzzle.service';
import { TilePlacementService } from '@app/services/tile-placement-service/tile-placement.service';
import { Random } from '@app/utils/random/random';
import { Orientation } from '@common/models/position';
import { BehaviorSubject, iif, Observable, of, timer } from 'rxjs';
import { map, mergeMap, takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import {
    PuzzleLevel,
    StartPuzzleModalComponent,
    StartPuzzleModalParameters,
} from '@app/components/puzzle/start-puzzle-modal/start-puzzle-modal.component';
import { puzzleSettings } from '@app/utils/settings';
import { Router } from '@angular/router';
import { ROUTE_HOME } from '@app/constants/routes-constants';
import { ENTER, ESCAPE } from '@app/constants/components-constants';
import { PuzzleResultModalComponent, PuzzleResultModalParameters } from '@app/components/puzzle/puzzle-result-modal/puzzle-result-modal.component';
import { WordPlacement } from '@common/models/word-finding';
import { PuzzleResult } from '@common/models/puzzle';
import { DefaultDialogComponent } from '@app/components/default-dialog/default-dialog.component';
import { DefaultDialogParameters } from '@app/components/default-dialog/default-dialog.component.types';
import {
    ABANDON_PUZZLE_DIALOG_BUTTON_ABANDON,
    ABANDON_PUZZLE_DIALOG_BUTTON_CONTINUE,
    ABANDON_PUZZLE_DIALOG_CONTENT,
    ABANDON_PUZZLE_DIALOG_TITLE,
} from '@app/constants/puzzle-constants';

export type RackTile = Tile & { isUsed: boolean; isSelected: boolean };

@Component({
    selector: 'app-puzzle-page',
    templateUrl: './puzzle-page.component.html',
    styleUrls: ['./puzzle-page.component.scss'],
})
export class PuzzlePageComponent implements OnInit {
    history: PuzzleResult[] = [];
    startGrid: SquareView[][];
    grid: BehaviorSubject<SquareView[][]> = new BehaviorSubject<SquareView[][]>([]);
    tiles: BehaviorSubject<RackTile[]> = new BehaviorSubject<RackTile[]>([]);
    isPlaying: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    level?: PuzzleLevel;
    timer?: Timer;

    private notAppliedSquares: SquareView[] = [];

    constructor(
        private readonly puzzleService: PuzzleService,
        readonly dragAndDropService: DragAndDropService,
        private readonly tilePlacementService: TilePlacementService,
        private readonly boardService: BoardService,
        private readonly dialog: MatDialog,
        private readonly router: Router,
    ) {}

    get stopPlaying(): Observable<boolean> {
        return this.isPlaying.pipe(mergeMap((isPlaying) => iif(() => !isPlaying, of(true))));
    }

    @HostListener('document:keypress', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): void {
        switch (event.key) {
            case ENTER:
                this.play();
                break;
        }
    }
    @HostListener('document:keydown.escape', ['$event'])
    handleKeyboardEventEsc(): void {
        this.tilePlacementService.resetTiles();
    }

    ngOnInit(): void {
        this.tilePlacementService.resetTiles();
        this.dragAndDropService.reset();

        this.tilePlacementService.tilePlacements$.subscribe((tilePlacements) => this.handleUsedTiles(tilePlacements));

        this.askStart();
    }

    askStart(): void {
        this.dialog.open<StartPuzzleModalComponent, Partial<StartPuzzleModalParameters>>(StartPuzzleModalComponent, {
            disableClose: true,
            data: {
                onStart: (level) => {
                    this.start(level.time);
                    this.level = level;
                    puzzleSettings.setTime(level.time);
                },
                onCancel: () => {
                    this.router.navigate([ROUTE_HOME]);
                },
                defaultTime: puzzleSettings.getTime(),
            },
        });
    }

    start(time: number): void {
        this.isPlaying.next(true);
        this.tilePlacementService.resetTiles();
        this.dragAndDropService.reset();
        this.clearNotAppliedSquares();

        this.puzzleService.start().subscribe((puzzle) => {
            const grid = puzzle.board.grid.map((row) => row.map((square) => new SquareView({ ...square }, SQUARE_SIZE)));
            this.startGrid = puzzle.board.grid.map((row) => row.map((square) => new SquareView({ ...square }, SQUARE_SIZE)));

            this.boardService.navigator = new BoardNavigator(grid, { row: 0, column: 0 }, Orientation.Horizontal);

            this.grid.next(grid);
            this.tiles.next(puzzle.tiles.map((tile) => ({ ...tile, isUsed: false, isSelected: false })));
        });

        this.startTimer(time);
    }

    cancelPlacement(): void {
        this.tilePlacementService.resetTiles();
    }

    canCancelPlacement(): Observable<boolean> {
        return this.tilePlacementService.tilePlacements$.pipe(map((placements) => placements.length > 0));
    }

    canPlay(): Observable<boolean> {
        return this.tilePlacementService.isPlacementValid$;
    }

    play(): boolean {
        const payload = this.tilePlacementService.createPlaceActionPayload();

        if (!payload) return false;

        const placement: WordPlacement = {
            orientation: payload.orientation,
            startPosition: payload.startPosition,
            tilesToPlace: payload.tiles,
        };

        this.stopPuzzle();

        this.puzzleService.complete(placement).subscribe((result) => {
            this.history.push(result);
            this.showEndOfPuzzleModal(result, placement);
        });

        return true;
    }

    abandon(): void {
        this.dialog.open<DefaultDialogComponent, DefaultDialogParameters>(DefaultDialogComponent, {
            data: {
                title: ABANDON_PUZZLE_DIALOG_TITLE,
                content: ABANDON_PUZZLE_DIALOG_CONTENT,
                buttons: [
                    {
                        content: ABANDON_PUZZLE_DIALOG_BUTTON_CONTINUE,
                        closeDialog: true,
                        key: ESCAPE,
                    },
                    {
                        content: ABANDON_PUZZLE_DIALOG_BUTTON_ABANDON,
                        style: 'background-color: tomato; color: white;',
                        closeDialog: true,
                        key: ENTER,
                        action: () => {
                            this.tilePlacementService.resetTiles();
                            this.stopPuzzle();

                            this.puzzleService.abandon().subscribe((result) => {
                                this.history.push(result);
                                this.showEndOfPuzzleModal(result, undefined);
                            });
                        },
                    },
                ],
            },
        });
    }

    timeout(): void {
        if (!this.play()) {
            this.tilePlacementService.resetTiles();
            this.stopPuzzle();

            this.puzzleService.timeout().subscribe((result) => {
                this.history.push(result);
                this.showEndOfPuzzleModal(result, undefined);
            });
        }
    }

    drop(event: CdkDragDrop<RackTile[]>) {
        const tile: RackTile = event.previousContainer.data[event.previousIndex];

        if (tile.isBlank || tile.letter === '*') tile.playedLetter = undefined;

        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        }
    }

    shuffleTiles(): void {
        this.tiles.next(Random.randomize(this.tiles.value));
    }

    stopPuzzle(): void {
        this.isPlaying.next(false);
        this.timer = undefined;
    }

    private startTimer(time: number): void {
        this.timer = Timer.convertTime(time);

        timer(time * SECONDS_TO_MILLISECONDS)
            .pipe(takeUntil(this.stopPlaying))
            .subscribe(() => this.timeout());
        timer(0, SECONDS_TO_MILLISECONDS)
            .pipe(takeUntil(this.stopPlaying))
            .subscribe(() => this.timer?.decrement());
    }

    private showEndOfPuzzleModal(result: PuzzleResult, placement: WordPlacement | undefined) {
        this.dialog.open<PuzzleResultModalComponent, PuzzleResultModalParameters>(PuzzleResultModalComponent, {
            disableClose: true,
            data: {
                grid: this.startGrid,
                result,
                placement,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                level: this.level!,
                onCancel: () => {
                    this.router.navigate([ROUTE_HOME]);
                },
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                onContinue: () => this.start(this.level!.time),
            },
        });
    }

    private handleUsedTiles(tilePlacements: TilePlacement[]) {
        this.clearNotAppliedSquares();

        const usedTiles = [...tilePlacements];
        for (const tile of this.tiles.value) {
            const index = usedTiles.findIndex((usedTile) => usedTile.tile.letter === tile.letter);
            tile.isUsed = index >= 0;
            if (index >= 0) usedTiles.splice(index, 1);
        }

        for (const placement of tilePlacements) {
            const squareView = this.grid.value[placement.position.row][placement.position.column];
            squareView.square.tile = placement.tile;
            squareView.applied = false;
            this.notAppliedSquares.push(squareView);
        }
        this.grid.next(this.grid.value);
    }

    private clearNotAppliedSquares(): void {
        for (const {
            square: { position },
        } of this.notAppliedSquares) {
            this.grid.value[position.row][position.column].square.tile = null;
        }
        this.notAppliedSquares = [];
        this.grid.next(this.grid.value);
    }
}
