/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { ActionData, ActionType, PlaceActionPayload } from '@app/classes/actions/action-data';
import { Orientation } from '@app/classes/actions/orientation';
import { BoardNavigator } from '@app/classes/board-navigator/board-navigator';
import Direction from '@app/classes/board-navigator/direction';
import { Vec2 } from '@app/classes/board-navigator/vec2';
import { Player } from '@app/classes/player';
import { Square, SquareView } from '@app/classes/square';
import { LetterValue, Tile } from '@app/classes/tile';
import { SquareComponent } from '@app/components/square/square.component';
import { CANNOT_REMOVE_UNUSED_TILE } from '@app/constants/component-errors';
import { BACKSPACE, ENTER, ESCAPE, KEYDOWN } from '@app/constants/components-constants';
import { SQUARE_SIZE, UNDEFINED_SQUARE } from '@app/constants/game-constants';
import { AppMaterialModule } from '@app/modules/material.module';
import { BoardService } from '@app/services';
import { UNKOWN_USER } from '@common/models/user';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BoardComponent } from './board.component';
import SpyObj = jasmine.SpyObj;

const OUT_OF_BOUNDS_POSITION = 999;

describe('BoardComponent', () => {
    let boardServiceSpy: SpyObj<BoardService>;
    let component: BoardComponent;
    let fixture: ComponentFixture<BoardComponent>;
    let getSquareSpy: jasmine.Spy;

    const BOARD_SERVICE_GRID_SIZE: Vec2 = { x: 5, y: 5 };
    const createGrid = (gridSize: Vec2): Square[][] => {
        const grid: Square[][] = [];
        for (let i = 0; i < gridSize.y; i++) {
            grid.push([]);
            for (let j = 0; j < gridSize.x; j++) {
                const mockSquare: Square = {
                    tile: null,
                    position: { row: i, column: j },
                    scoreMultiplier: null,
                    wasMultiplierUsed: false,
                    isCenter: false,
                };
                grid[i].push(mockSquare);
            }
        }
        return grid;
    };

    const boardSizesToTest = [
        [
            { x: -1, y: -1 },
            { x: 0, y: 0 },
        ],
        [
            { x: 0, y: 0 },
            { x: 0, y: 0 },
        ],
        [
            { x: 15, y: 15 },
            { x: 15, y: 15 },
        ],
        [
            { x: 15, y: 10 },
            { x: 15, y: 10 },
        ],
    ];

    beforeEach(() => {
        boardServiceSpy = jasmine.createSpyObj(
            'BoardService',
            ['initializeBoard', 'subscribeToInitializeBoard', 'subscribeToBoardUpdate', 'updateBoard', 'readInitialBoard'],
            ['boardInitialization$', 'boardUpdateEvent$', 'initialBoard'],
        );

        const updateObs = new Subject<Square[]>();
        const initObs = new Subject<Square[][]>();

        boardServiceSpy.readInitialBoard.and.returnValue(createGrid(BOARD_SERVICE_GRID_SIZE));
        boardServiceSpy.subscribeToInitializeBoard.and.callFake((destroy$: Observable<boolean>, next: (board: Square[][]) => void) => {
            return initObs.pipe(takeUntil(destroy$)).subscribe(next);
        });
        boardServiceSpy.subscribeToBoardUpdate.and.callFake((destroy$: Observable<boolean>, next: (squaresToUpdate: Square[]) => void) => {
            return updateObs.pipe(takeUntil(destroy$)).subscribe(next);
        });
        boardServiceSpy.initializeBoard.and.callFake((board: Square[][]) => initObs.next(board));
        boardServiceSpy.updateBoard.and.callFake((squares: Square[]) => updateObs.next(squares));
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                MatGridListModule,
                MatCardModule,
                MatProgressSpinnerModule,
                MatIconModule,
                MatButtonModule,
                ReactiveFormsModule,
                CommonModule,
                MatInputModule,
                BrowserAnimationsModule,
                AppMaterialModule,
                MatFormFieldModule,
                FormsModule,
                MatDialogModule,
                RouterTestingModule,
                HttpClientTestingModule,
            ],
            declarations: [BoardComponent, SquareComponent],
            providers: [{ provide: BoardService, useValue: boardServiceSpy }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(BoardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        const grid: Square[][] = createGrid(BOARD_SERVICE_GRID_SIZE);
        getSquareSpy = spyOn<any>(component, 'getSquare').and.callFake((board: Square[][], row: number, column: number) => {
            return board[row][column];
        });
        component['initializeBoard'](grid);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Component should call initializeBoard on init if service has a board', () => {
        const initSpy = spyOn<any>(component, 'initializeBoard');
        component.ngOnInit();
        expect(initSpy).toHaveBeenCalled();
    });

    it('Component should NOT call initializeBoard on init if service has NO board', () => {
        boardServiceSpy.readInitialBoard.and.returnValue(undefined as unknown as Square[][]);
        const initSpy = spyOn<any>(component, 'initializeBoard');
        component.ngOnInit();
        expect(initSpy).not.toHaveBeenCalled();
    });

    it('Component should clearCursor when the round ends', () => {
        const clearCursorSpy = spyOn<any>(component, 'clearCursor').and.callFake(() => {
            return;
        });
        component['roundManagerService']['endRoundEvent$'].next();
        expect(clearCursorSpy).toHaveBeenCalled();
    });

    boardSizesToTest.forEach((testCase) => {
        const boardSize: Vec2 = testCase[0];
        const expectedBoardSize: Vec2 = testCase[1];

        if (!expectedBoardSize) {
            return;
        }
        it(
            'Initializing board of size ' +
                boardSize.x +
                ' : ' +
                boardSize.y +
                ' should create board of size ' +
                expectedBoardSize.x +
                ' : ' +
                expectedBoardSize.y,
            () => {
                component.squareGrid = [];
                component.gridSize = { x: 0, y: 0 };
                const grid: Square[][] = createGrid(boardSize);
                getSquareSpy.and.callFake((board: Square[][], row: number, column: number) => {
                    return board[row][column];
                });

                component['initializeBoard'](grid);

                let actualRowAmount = 0;
                let actualColAmount = 0;

                if (component.squareGrid) {
                    actualRowAmount = component.squareGrid.length;
                    /*
                    If the Grid size is supposed to be smaller or equal to 0,
                    then each row of the grid will not be initialized.
                    So if the row is undefined, its length is 0
                    If the expected size is greater than 0, then the row length is defined
                */
                    actualColAmount = component.squareGrid[0] ? component.squareGrid[0].length : 0;
                }
                const actualBoardSize: Vec2 = { x: actualColAmount, y: actualRowAmount };
                expect(actualBoardSize).toEqual(expectedBoardSize);
            },
        );
    });

    it('initializeBoard should create board navigator', () => {
        component.navigator = undefined as unknown as BoardNavigator;
        component['initializeBoard'](createGrid(BOARD_SERVICE_GRID_SIZE));
        expect(component.navigator).toBeTruthy();
    });

    it('Call to BoardService getGridSize should assign right value to gridSize', () => {
        expect(component.gridSize).toEqual(BOARD_SERVICE_GRID_SIZE);
    });

    it('If BoardService returns grid with null squares, should assign UNDEFINED_SQUARE to board', () => {
        const grid = [
            [UNDEFINED_SQUARE, null],
            [UNDEFINED_SQUARE, null],
        ];
        const expectedGrid = [
            [UNDEFINED_SQUARE, UNDEFINED_SQUARE],
            [UNDEFINED_SQUARE, UNDEFINED_SQUARE],
        ];
        getSquareSpy.and.callFake((board: Square[][], row: number, column: number) => {
            return board[row][column];
        });

        fixture = TestBed.createComponent(BoardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        component['initializeBoard'](grid as unknown as Square[][]);

        const actualSquareGrid = component.squareGrid.map((row: SquareView[]) => {
            return row.map((sv: SquareView) => sv.square);
        });
        expect(actualSquareGrid).toEqual(expectedGrid);
    });

    it('BoardService update event should update board', () => {
        const updateSpy = spyOn<any>(component, 'updateBoard');
        boardServiceSpy.updateBoard([component.squareGrid[0][0].square]);
        expect(updateSpy).toHaveBeenCalledWith([component.squareGrid[0][0].square]);
    });

    it('boardInitializationEvent should call initializeBoard', () => {
        const grid: Square[][] = createGrid(BOARD_SERVICE_GRID_SIZE);
        const initSpy = spyOn<any>(component, 'initializeBoard').and.callFake(() => {
            return;
        });
        boardServiceSpy.initializeBoard(grid);
        expect(initSpy).toHaveBeenCalled();
    });

    it('Update Board with no squares in argument should return false', () => {
        expect(component['updateBoard']([])).toBeFalsy();
    });

    it('Update Board with more squares that in the grid should return false', () => {
        const squaresToUpdate: Square[] = Array.from(Array(component.gridSize.x * component.gridSize.y + 1), () => UNDEFINED_SQUARE);
        expect(component['updateBoard'](squaresToUpdate)).toBeFalsy();
    });

    it('Update Board with with one square should only change that square', () => {
        const currentSquareView: SquareView = component.squareGrid[0][0];
        const squaresToUpdate: Square[] = [
            {
                tile: null,
                position: { row: 0, column: 0 },
                scoreMultiplier: null,
                wasMultiplierUsed: !currentSquareView.square.wasMultiplierUsed,
                isCenter: false,
            },
        ];
        component['updateBoard'](squaresToUpdate);
        expect(component.squareGrid[0][0].square).toEqual(squaresToUpdate[0]);
    });

    it('Update Board with with multiple squares should change all the squares', () => {
        const squaresToUpdate: Square[] = [
            {
                tile: null,
                position: { row: 0, column: 0 },
                scoreMultiplier: null,
                wasMultiplierUsed: true,
                isCenter: false,
            },
            {
                tile: null,
                position: { row: 1, column: 0 },
                scoreMultiplier: null,
                wasMultiplierUsed: false,
                isCenter: true,
            },
            {
                tile: { letter: 'A', value: 0 },
                position: { row: 0, column: 1 },
                scoreMultiplier: null,
                wasMultiplierUsed: false,
                isCenter: false,
            },
        ];
        component['updateBoard'](squaresToUpdate);
        expect(component.squareGrid[0][0].square).toEqual(squaresToUpdate[0]);
        expect(component.squareGrid[1][0].square).toEqual(squaresToUpdate[1]);
        expect(component.squareGrid[0][1].square).toEqual(squaresToUpdate[2]);
    });

    it('Update Board with with squares not in the board should not update the board', () => {
        const initBoard = [...component.squareGrid];
        const squaresToUpdate: Square[] = [
            {
                tile: null,
                position: { row: component.gridSize.x + 1, column: 0 },
                scoreMultiplier: null,
                wasMultiplierUsed: true,
                isCenter: false,
            },
            {
                tile: null,
                position: { row: 1, column: component.gridSize.y + 1 },
                scoreMultiplier: null,
                wasMultiplierUsed: false,
                isCenter: true,
            },
            {
                tile: { letter: 'A', value: 0 },
                position: { row: component.gridSize.x + 1, column: component.gridSize.y + 1 },
                scoreMultiplier: null,
                wasMultiplierUsed: false,
                isCenter: false,
            },
            {
                tile: { letter: 'Z', value: 1 },
                position: { row: -1, column: -1 },
                scoreMultiplier: null,
                wasMultiplierUsed: false,
                isCenter: false,
            },
        ];
        component['updateBoard'](squaresToUpdate);
        expect(component.squareGrid).toEqual(initBoard);
    });

    it('should call handlePlaceTiles on playingTiles', () => {
        const spy = spyOn<any>(component, 'handlePlaceTiles');
        component['gameViewEventManagerService'].emitGameViewEvent('usedTiles');
        expect(spy).toHaveBeenCalled();
    });

    describe('isInBounds', () => {
        it('return true if is in bound', () => {
            const position = { row: 0, column: 0 };
            expect(component['isInBounds'](position)).toBeTrue();
        });
        it('return false if is not in bound', () => {
            const position = { row: OUT_OF_BOUNDS_POSITION, column: OUT_OF_BOUNDS_POSITION };
            expect(component['isInBounds'](position)).toBeFalse();
        });
    });

    describe('handlePlaceTiles', () => {
        let payload: PlaceActionPayload;

        beforeEach(() => {
            payload = {
                tiles: [new Tile('A', 0), new Tile('B', 0)],
                orientation: Orientation.Horizontal,
                startPosition: { row: 0, column: 0 },
            };
        });

        it('should add squareView to notAppliedSquares', () => {
            component['handlePlaceTiles'](payload);

            expect(component['notAppliedSquares'].length).toEqual(payload.tiles.length);
        });

        it('should place tiles on grid', () => {
            component['handlePlaceTiles'](payload);

            for (let i = 0; i < payload.tiles.length; ++i) {
                expect(component.squareGrid[0][i].square.tile).toBeDefined();
                expect(component.squareGrid[0][i].square.tile!.letter).toEqual(payload.tiles[i].letter);
                expect(component.squareGrid[0][i].square.tile!.value).toEqual(payload.tiles[i].value);
                expect(component.squareGrid[0][i].applied).toBeFalse();
            }
        });

        it('should place tiles on grid', () => {
            payload.orientation = Orientation.Vertical;

            component['handlePlaceTiles'](payload);

            for (let i = 0; i < payload.tiles.length; ++i) {
                expect(component.squareGrid[i][0].square.tile).toBeDefined();
                expect(component.squareGrid[i][0].square.tile!.letter).toEqual(payload.tiles[i].letter);
                expect(component.squareGrid[i][0].square.tile!.value).toEqual(payload.tiles[i].value);
                expect(component.squareGrid[i][0].applied).toBeFalse();
            }
        });

        it('should not place tiles when position is out of bounds', () => {
            payload.startPosition.column = OUT_OF_BOUNDS_POSITION;

            component['handlePlaceTiles'](payload);

            expect(component.squareGrid[0].some((sv) => sv.square.tile !== null)).toBeFalse();
        });

        it('should not change tile if applied is true', () => {
            component.squareGrid[0][1].square.tile = new Tile('Z', 0);
            component.squareGrid[0][1].applied = true;

            component['handlePlaceTiles'](payload);

            expect(component.squareGrid[0][1].square.tile).toBeDefined();
            expect(component.squareGrid[0][1].square.tile!.letter).not.toEqual(payload.tiles[1].letter);
            expect(component.squareGrid[0][1].applied).toBeTrue();
        });

        it('should not change tile if applied is true', () => {
            component.squareGrid[0][0].square.tile = new Tile('Z', 0);

            component['handlePlaceTiles'](payload);

            expect(component.squareGrid[0][1].square.tile).toEqual(null);
        });

        it('should reset notAppliedSquares values', () => {
            const squareView: SquareView = new SquareView(UNDEFINED_SQUARE, SQUARE_SIZE);
            squareView.square.tile = new Tile('A', 0);
            component['notAppliedSquares'] = [squareView];
            component['handlePlaceTiles'](undefined);

            expect(squareView.square.tile).toBeNull();
        });
    });

    describe('handlePlaceLetter', () => {
        let tiles: LetterValue[];
        let usedTiles: LetterValue[] = [];
        let nextEmptySpy: jasmine.Spy;
        let useTileSpy: jasmine.Spy;
        let getLocalPlayerSpy: jasmine.Spy;
        let getGameViewEventValueSpy: jasmine.Spy;
        let getTilesSpy: jasmine.Spy;
        let squareView: SquareView;
        let canPlaceSpy: jasmine.Spy;

        beforeEach(() => {
            tiles = ['A', 'B', 'C', '*'];
            usedTiles = ['C', 'D'];

            const player = new Player('http://endless.horse', UNKOWN_USER, []);
            getTilesSpy = spyOn(player, 'getTiles').and.returnValue(
                tiles.map<Tile>((letter) => (letter === '*' ? { letter, isBlank: true } : { letter }) as Tile),
            );
            getLocalPlayerSpy = spyOn(component['gameService'], 'getLocalPlayer').and.returnValue(player);

            getGameViewEventValueSpy = spyOn<any>(component['gameViewEventManagerService'], 'getGameViewEventValue').and.returnValue({
                tiles: usedTiles.map<Tile>((letter) => ({ letter } as Tile)),
            });

            nextEmptySpy = spyOn(component['navigator'], 'nextEmpty').and.returnValue(undefined);

            useTileSpy = spyOn<any>(component, 'useTile');

            canPlaceSpy = spyOn<any>(component, 'canPlace').and.returnValue(true);
        });

        const tests: [letter: string, isUppercase: boolean, calls: boolean][] = [
            ['A', false, true],
            ['a', false, true],
            ['B', false, true],
            ['C', false, false],
            ['Z', false, false],
            ['C', true, true],
            ['Z', true, true],
            ['*', true, false],
            ['!', true, false],
        ];

        for (const [letter, isUppercase, calls] of tests) {
            it(`it should ${calls ? '' : 'not'} call useTile \
                and nextEmpty with letter ${letter} as ${isUppercase ? 'uppercase' : 'lowecase'}`, () => {
                spyOn(component['navigator'], 'clone').and.returnValue(component['navigator']);
                component['handlePlaceLetter'](letter, isUppercase, squareView);

                const spies = [useTileSpy, nextEmptySpy];

                for (const spy of spies) {
                    if (calls) expect(spy).toHaveBeenCalled();
                    else expect(spy).not.toHaveBeenCalled();
                }
            });
        }

        it('should not call useTile if no localPlayer', () => {
            getLocalPlayerSpy.and.returnValue(undefined);
            component['handlePlaceLetter'](tiles[0], false, squareView);

            expect(useTileSpy).not.toHaveBeenCalled();
        });

        it('should work even if not value for usedTile', () => {
            getGameViewEventValueSpy.and.returnValue(undefined);
            component['handlePlaceLetter'](tiles[0], false, squareView);

            expect(useTileSpy).toHaveBeenCalled();
        });

        it('should not call useTile if canPlace', () => {
            canPlaceSpy.and.returnValue(false);
            component['handlePlaceLetter'](tiles[0], false, undefined);

            expect(useTileSpy).not.toHaveBeenCalled();
        });

        it('should not call useTile if try using blank letter but has none', () => {
            getTilesSpy.and.returnValue([{ letter: 'A', isBlank: false }]);
            component['handlePlaceLetter']('C', true, squareView);

            expect(useTileSpy).not.toHaveBeenCalled();
        });
    });

    describe('canPlace', () => {
        let squareView: SquareView;
        beforeEach(() => {
            squareView = { square: { tile: null } } as SquareView;
            component['actionService'].hasActionBeenPlayed = false;
        });

        it('should return false if no squareView', () => {
            expect(component['canPlace'](undefined)).toBeFalse();
        });

        it('should return false if no tiles are used', () => {
            component['actionService'].hasActionBeenPlayed = true;
            expect(component['canPlace'](squareView)).toBeFalse();
        });

        it('should return false if tile is not null', () => {
            squareView.square.tile = 'not-null' as unknown as Tile;
            expect(component['canPlace'](squareView)).toBeFalse();
        });

        it('should return true if conditions are met', () => {
            expect(component['canPlace'](squareView)).toBeTrue();
        });
    });

    describe('handleBackspace', () => {
        let selectedSquare: SquareView;
        let previousSquare: SquareView;
        let nextEmptySpy: jasmine.Spy;
        let removeUsedTileSpy: jasmine.Spy;
        let canBackspaceSpy: jasmine.Spy;

        beforeEach(() => {
            selectedSquare = { square: { tile: {} } } as SquareView;
            previousSquare = { square: { tile: {} } } as SquareView;

            component['selectedSquare'] = selectedSquare;
            component['notAppliedSquares'] = [previousSquare];

            nextEmptySpy = spyOn(component['navigator'], 'nextEmpty').and.returnValue(previousSquare);
            removeUsedTileSpy = spyOn<any>(component, 'removeUsedTile');
            spyOn<any>(component, 'areTilesUsed').and.returnValue(true);
            canBackspaceSpy = spyOn<any>(component, 'canBackspace').and.returnValue(true);
        });

        it('should call nextEmpty with backward direction', () => {
            component['handleBackspace']();
            expect(nextEmptySpy).toHaveBeenCalledOnceWith(Direction.Backward, true);
        });

        it('should not call nextEmpty if the index is found', () => {
            spyOn(component['notAppliedSquares'], 'indexOf').and.returnValue(1);

            component['handleBackspace']();

            expect(nextEmptySpy).not.toHaveBeenCalled();
        });

        it('should set selectedSquare to nextSquare', () => {
            component['handleBackspace']();

            expect(component['selectedSquare']).toEqual(previousSquare);
        });

        it('should remove previousSquare from notAppliedSquares', () => {
            component['handleBackspace']();

            expect(component['notAppliedSquares']).not.toContain(previousSquare);
        });

        it('should not change notAppliedSquare if previousSquare not in it', () => {
            component['notAppliedSquares'] = [{}, {}] as SquareView[];
            const expected = component['notAppliedSquares'].length;

            component['handleBackspace']();

            expect(component['notAppliedSquares']).toHaveSize(expected);
        });

        it('should call removeUsedTile if tile is defined', () => {
            const tile = previousSquare.square.tile;
            component['handleBackspace']();

            expect(removeUsedTileSpy).toHaveBeenCalledOnceWith(tile);
        });

        it('should not call removeUsedTile if previousSquare does not have a tile', () => {
            previousSquare.square.tile = null;
            component['handleBackspace']();

            expect(removeUsedTileSpy).not.toHaveBeenCalled();
        });

        it("should set previousSquare's tile to null", () => {
            component['handleBackspace']();

            expect(previousSquare.square.tile).toBeNull();
        });

        it('should not change notAppliedSquares if no previousSquare', () => {
            nextEmptySpy.and.returnValue(undefined);
            const expected = component['notAppliedSquares'].length;

            component['handleBackspace']();

            expect(component['notAppliedSquares']).toHaveSize(expected);
        });

        it('should not call nextEmpty if canBackspace', () => {
            canBackspaceSpy.and.returnValue(false);

            component['handleBackspace']();

            expect(nextEmptySpy).not.toHaveBeenCalled();
        });
    });

    describe('canBackspace', () => {
        let tileUsedSpy: jasmine.Spy;

        beforeEach(() => {
            component.selectedSquare = {} as SquareView;
            tileUsedSpy = spyOn<any>(component, 'areTilesUsed').and.returnValue(true);
            component['actionService'].hasActionBeenPlayed = false;
        });

        it('should return false if no selected square', () => {
            component.selectedSquare = undefined as unknown as SquareView;
            expect(component['canBackspace']()).toBeFalse();
        });

        it('should return false if no tiles are used', () => {
            tileUsedSpy.and.returnValue(false);
            expect(component['canBackspace']()).toBeFalse();
        });

        it('should return false if action has been played', () => {
            component['actionService'].hasActionBeenPlayed = true;
            expect(component['canBackspace']()).toBeFalse();
        });

        it('should return true if conditions are met', () => {
            expect(component['canBackspace']()).toBeTrue();
        });
    });

    describe('handleEnter', () => {
        let getPayloadSpy: jasmine.Spy;
        const fakeData = { fake: 'data' };
        let createActionDataSpy: jasmine.Spy;
        let sendAction: jasmine.Spy;
        let clearCursorSpy: jasmine.Spy;

        beforeEach(() => {
            getPayloadSpy = spyOn(component['gameViewEventManagerService'], 'getGameViewEventValue');
            spyOn(component['gameService'], 'getGameId').and.returnValue('gameId');
            spyOn(component['gameService'], 'getLocalPlayerId').and.returnValue('playerId');

            createActionDataSpy = spyOn(component['actionService'], 'createActionData').and.returnValue(fakeData as unknown as ActionData);
            sendAction = spyOn(component['actionService'], 'sendAction').and.callFake(() => {
                return;
            });
            clearCursorSpy = spyOn<any>(component, 'clearCursor').and.callFake(() => {
                return;
            });
        });

        it('should sendAction through ActionService', () => {
            const payload: PlaceActionPayload = {} as PlaceActionPayload;
            getPayloadSpy.and.returnValue(payload);

            component['handleEnter']();

            expect(createActionDataSpy).toHaveBeenCalledWith(ActionType.PLACE, payload);
            expect(sendAction).toHaveBeenCalledOnceWith('gameId', fakeData);
        });

        it('should not call sendPlaceAction if no payload', () => {
            getPayloadSpy.and.returnValue(undefined);

            component['handleEnter']();

            expect(sendAction).not.toHaveBeenCalled();
        });

        it('should call clearCursor', () => {
            getPayloadSpy.and.returnValue({} as PlaceActionPayload);

            component['handleEnter']();

            expect(clearCursorSpy).toHaveBeenCalled();
        });
    });

    describe('clearCursor', () => {
        let resetSpy: jasmine.Spy;

        beforeEach(() => {
            resetSpy = spyOn<any>(component['gameViewEventManagerService'], 'emitGameViewEvent');
            component.selectedSquare = {} as SquareView;
        });

        it('should set selectedSquare to undefined', () => {
            component['clearCursor']();

            expect(component.selectedSquare).toBeUndefined();
        });

        it('should emit resetUsedTiles event if no actions are played', () => {
            component['actionService'].hasActionBeenPlayed = false;
            component['clearCursor']();

            expect(resetSpy).toHaveBeenCalledWith('resetUsedTiles');
        });

        it('should NOT emit resetUsedTiles event if actions are played', () => {
            component['actionService'].hasActionBeenPlayed = true;
            component['clearCursor']();

            expect(resetSpy).not.toHaveBeenCalledWith('resetUsedTiles');
        });
    });

    describe('onFocusableEvent', () => {
        const tests: [key: string, type: string, method: string, called: boolean][] = [
            [BACKSPACE, KEYDOWN, 'handleBackspace', true],
            [BACKSPACE, 'any', 'handleBackspace', false],
            [ESCAPE, KEYDOWN, 'clearCursor', true],
            [ESCAPE, 'any', 'clearCursor', false],
            [ENTER, 'any', 'handleEnter', true],
            ['A', 'any', 'handlePlaceLetter', true],
            ['M', 'any', 'handlePlaceLetter', true],
            ['Z', 'any', 'handlePlaceLetter', true],
        ];

        for (const [key, type, method, called] of tests) {
            it(`should ${called ? 'not' : ''} call ${method} on ${key} when type=${type}`, () => {
                const event: KeyboardEvent = { key, type } as KeyboardEvent;
                const spy = spyOn<any>(component, method);

                component['onFocusableEvent'](event);

                if (called) expect(spy).toHaveBeenCalled();
                else expect(spy).not.toHaveBeenCalled();
            });
        }

        it('should call handlePlaceLetter with key, shift and selected square by default', () => {
            const event: KeyboardEvent = { key: 'A', shiftKey: true } as KeyboardEvent;
            const spy = spyOn<any>(component, 'handlePlaceLetter');
            const selectedSquare: SquareView = {} as SquareView;
            component.selectedSquare = selectedSquare;

            component['onFocusableEvent'](event);

            expect(spy).toHaveBeenCalledOnceWith(event.key, event.shiftKey, selectedSquare);
        });
    });

    describe('onLooseFocusEvent', () => {
        beforeEach(() => {
            component.ngOnInit();
        });

        it('should call clearCursor', () => {
            const spy = spyOn<any>(component, 'clearCursor');

            component['onLoseFocusEvent']!();

            expect(spy).toHaveBeenCalled();
        });
    });

    describe('onSquareClick', () => {
        let squareView: SquareView;
        let isLocalPlayerPlaying: jasmine.Spy;
        let clearCursorSpy: jasmine.Spy;

        beforeEach(() => {
            squareView = new SquareView(
                {
                    tile: null,
                    position: { row: 0, column: 0 },
                    scoreMultiplier: null,
                    wasMultiplierUsed: false,
                    isCenter: false,
                },
                {
                    x: 1,
                    y: 0,
                },
            );

            isLocalPlayerPlaying = spyOn(component['gameService'], 'isLocalPlayerPlaying');
            isLocalPlayerPlaying.and.returnValue(true);
            component['actionService'].hasActionBeenPlayed = false;
            clearCursorSpy = spyOn<any>(component, 'clearCursor').and.callFake(() => {
                return;
            });
        });

        it('should set component as active keyboard component', () => {
            const spy = spyOn(component['focusableComponentService'], 'setActiveKeyboardComponent');

            component.onSquareClick(squareView);

            expect(spy).toHaveBeenCalledOnceWith(component);
        });

        it('should emit resetUsedTiles event', () => {
            const spy = spyOn<any>(component['gameViewEventManagerService'], 'emitGameViewEvent');

            component.onSquareClick(squareView);

            expect(spy).toHaveBeenCalledWith('resetUsedTiles');
        });

        it('should set selectedSquare is squareView is not selectedSquareView', () => {
            component.selectedSquare = undefined;

            component.onSquareClick(squareView);

            expect(component.selectedSquare as unknown as SquareView).toEqual(squareView);
        });

        it('should switch orientation if squareView is selectedSquare (horizontal)', () => {
            component.navigator.orientation = Orientation.Horizontal as Orientation;
            component.selectedSquare = squareView;

            component.onSquareClick(squareView);

            expect(component.navigator.orientation).toEqual(Orientation.Vertical);
        });

        it('should switch orientation if squareView is selectedSquare (vertical)', () => {
            component.navigator.orientation = Orientation.Vertical as Orientation;
            component.selectedSquare = squareView;

            component.onSquareClick(squareView);

            expect(component.navigator.orientation).toEqual(Orientation.Horizontal);
        });

        it('should do nothing if squareView has a tile', () => {
            (squareView.square.tile as unknown) = 'a tile';
            expect(component.onSquareClick(squareView)).toBeFalse();
        });

        it('should do nothing is localPlayerIsNotPlaying', () => {
            isLocalPlayerPlaying.and.returnValue(false);
            expect(component.onSquareClick(squareView)).toBeFalse();
        });

        it('should clear cursor if action has been played', () => {
            component['actionService'].hasActionBeenPlayed = true;
            expect(component.onSquareClick(squareView)).toBeFalse();
            expect(clearCursorSpy).toHaveBeenCalled();
        });
    });

    describe('isSamePosition', () => {
        let s1: SquareView;
        let s2: SquareView;

        beforeEach(() => {
            s1 = new SquareView(
                {
                    tile: null,
                    position: { row: 0, column: 0 },
                    scoreMultiplier: null,
                    wasMultiplierUsed: false,
                    isCenter: false,
                },
                {
                    x: 1,
                    y: 0,
                },
            );
            s2 = new SquareView(
                {
                    tile: null,
                    position: { row: 0, column: 0 },
                    scoreMultiplier: null,
                    wasMultiplierUsed: false,
                    isCenter: false,
                },
                {
                    x: 1,
                    y: 0,
                },
            );
        });

        it('should return false if undefined (both)', () => {
            expect(component.isSamePosition(undefined, undefined)).toBeFalse();
        });

        it('should return false if undefined (s1)', () => {
            expect(component.isSamePosition(undefined, s2)).toBeFalse();
        });

        it('should return false if undefined (s2)', () => {
            expect(component.isSamePosition(s1, undefined)).toBeFalse();
        });

        it('should return false if not same position', () => {
            s1.square.position = { row: 1, column: 1 };
            expect(component.isSamePosition(s1, s2)).toBeFalse();
        });

        it('should return true if same position', () => {
            expect(component.isSamePosition(s1, s2)).toBeTrue();
        });
    });

    describe('useTile', () => {
        let emitGameViewEventSpy: jasmine.Spy;
        let getGameViewEventValueSpy: jasmine.Spy;
        let tile: Tile;

        beforeEach(() => {
            getGameViewEventValueSpy = spyOn<any>(component['gameViewEventManagerService'], 'getGameViewEventValue');
            emitGameViewEventSpy = spyOn(component['gameViewEventManagerService'], 'emitGameViewEvent');
            tile = {} as Tile;
        });

        it('should call emitToGameViewEvent if has usedTiles', () => {
            const previousPayload: PlaceActionPayload = {
                orientation: Orientation.Horizontal,
                startPosition: { row: 0, column: 0 },
                tiles: [],
            };
            getGameViewEventValueSpy.and.returnValue(previousPayload);

            const expectedPayload = {
                ...previousPayload,
                tiles: [...previousPayload.tiles, tile],
            };

            component['useTile'](tile);

            expect(emitGameViewEventSpy).toHaveBeenCalledOnceWith('usedTiles', expectedPayload);
        });

        it('should call emitToGameViewEvent if doesnt have usedTiles', () => {
            getGameViewEventValueSpy.and.returnValue(undefined);

            component.navigator.orientation = Orientation.Vertical;
            component.navigator.setPosition({ row: 1, column: 2 });

            const expectedPayload: PlaceActionPayload = {
                orientation: component.navigator.orientation,
                startPosition: { row: component.navigator.row, column: component.navigator.column },
                tiles: [tile],
            };

            component['useTile'](tile);

            expect(emitGameViewEventSpy).toHaveBeenCalledOnceWith('usedTiles', expectedPayload);
        });
    });

    describe('removeUsedTile', () => {
        let emitGameViewEventSpy: jasmine.Spy;
        let getGameViewEventValueSpy: jasmine.Spy;
        let tile: Tile;

        beforeEach(() => {
            getGameViewEventValueSpy = spyOn<any>(component['gameViewEventManagerService'], 'getGameViewEventValue');
            emitGameViewEventSpy = spyOn(component['gameViewEventManagerService'], 'emitGameViewEvent');
            tile = {} as Tile;
        });

        it('should throw if previousUsedTiles is undefined', () => {
            getGameViewEventValueSpy.and.returnValue(undefined);

            expect(() => component['removeUsedTile'](tile)).toThrowError(CANNOT_REMOVE_UNUSED_TILE);
        });

        it('should throw if tile is not in previousTiles', () => {
            const previousUsedTiles = { tiles: [{ letter: 'A' }, { letter: 'B' }] as Tile[] };
            getGameViewEventValueSpy.and.returnValue(previousUsedTiles);
            const tileToRemove: Tile = new Tile('C', 0, false);

            expect(() => component['removeUsedTile'](tileToRemove)).toThrowError(CANNOT_REMOVE_UNUSED_TILE);
        });

        it('should remove tile from previousUsedTiles', () => {
            const previousUsedTiles = { tiles: [{ letter: 'A' }, { letter: 'B' }] as Tile[] };
            const tileToRemove = previousUsedTiles.tiles[0];
            const size = previousUsedTiles.tiles.length;

            getGameViewEventValueSpy.and.returnValue(previousUsedTiles);

            component['removeUsedTile'](tileToRemove);

            expect(previousUsedTiles).toHaveSize(size - 1);
            expect(previousUsedTiles).not.toContain(tileToRemove);
        });

        it('should emit same payload with modified tiles', () => {
            const previousUsedTiles = { tiles: [{ letter: 'A' }, { letter: 'B' }] as Tile[] };
            const tileToRemove = previousUsedTiles.tiles[0];

            getGameViewEventValueSpy.and.returnValue(previousUsedTiles);

            component['removeUsedTile'](tileToRemove);

            expect(emitGameViewEventSpy).toHaveBeenCalledOnceWith('usedTiles', previousUsedTiles);
        });

        it('should emit resetUsed tiles if there is only one left', () => {
            const previousUsedTiles = { tiles: [{ letter: 'A' }] as Tile[] };
            const tileToRemove = previousUsedTiles.tiles[0];

            getGameViewEventValueSpy.and.returnValue(previousUsedTiles);

            component['removeUsedTile'](tileToRemove);

            expect(emitGameViewEventSpy).toHaveBeenCalledOnceWith('resetUsedTiles');
        });
    });

    describe('areTilesUsed', () => {
        it('areTilesUsed should return true if usedTiles has tiles', () => {
            const placePayload: PlaceActionPayload = {
                tiles: [new Tile('A', 1)],
                startPosition: { row: 0, column: 0 },
                orientation: Orientation.Horizontal,
            };
            spyOn(component['gameViewEventManagerService'], 'getGameViewEventValue').and.returnValue(placePayload);
            const result = component['areTilesUsed']();
            expect(result).toBeTrue();
        });

        it('areTilesUsed should return false if usedTiles has no tiles', () => {
            const emptyPlacePayload: PlaceActionPayload = {
                tiles: [],
                startPosition: { row: -1, column: -1 },
                orientation: Orientation.Horizontal,
            };
            spyOn(component['gameViewEventManagerService'], 'getGameViewEventValue').and.returnValue(emptyPlacePayload);
            const result = component['areTilesUsed']();
            expect(result).toBeFalse();
        });
    });

    describe('clearNewlyPlacedTiles', () => {
        let newlyPlacedTiles: SquareView[];

        beforeEach(() => {
            newlyPlacedTiles = [{ newlyPlaced: true }, { newlyPlaced: true }] as SquareView[];
            component['newlyPlacedTiles'] = newlyPlacedTiles;
        });

        it('should set newlyPlaced to false', () => {
            component.clearNewlyPlacedTiles();

            newlyPlacedTiles.forEach((squareView) => expect(squareView.newlyPlaced).toBeFalse());
        });

        it('should clear array', () => {
            component.clearNewlyPlacedTiles();

            expect(component['newlyPlacedTiles']).toHaveSize(0);
        });
    });
});
