import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardComponent } from './board.component';

describe('Board2Component', () => {
    let component: BoardComponent;
    let fixture: ComponentFixture<BoardComponent>;

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
            [
                'initializeBoard',
                'subscribeToInitializeBoard',
                'subscribeToBoardUpdate',
                'updateBoard',
                'readInitialBoard',
                'subscribeToTemporaryTilePlacements',
                'updateTemporaryTilePlacements',
            ],
            ['boardInitialization$', 'boardUpdateEvent$', 'initialBoard'],
        );

        const updateObs = new Subject<Square[]>();
        const initObs = new Subject<Square[][]>();
        const tilePlacementObs = new Subject<TilePlacement[]>();

        boardServiceSpy.readInitialBoard.and.returnValue(createGrid(BOARD_SERVICE_GRID_SIZE));
        boardServiceSpy.subscribeToInitializeBoard.and.callFake((destroy$: Observable<boolean>, next: (board: Square[][]) => void) => {
            return initObs.pipe(takeUntil(destroy$)).subscribe(next);
        });
        boardServiceSpy.subscribeToTemporaryTilePlacements.and.callFake(
            (destroy$: Observable<boolean>, next: (tilePlacement: TilePlacement[]) => void) => {
                return tilePlacementObs.pipe(takeUntil(destroy$)).subscribe(next);
            },
        );
        boardServiceSpy.subscribeToBoardUpdate.and.callFake((destroy$: Observable<boolean>, next: (squaresToUpdate: Square[]) => void) => {
            return updateObs.pipe(takeUntil(destroy$)).subscribe(next);
        });
        boardServiceSpy.initializeBoard.and.callFake((board: Square[][]) => initObs.next(board));
        boardServiceSpy.updateBoard.and.callFake((squares: Square[]) => updateObs.next(squares));
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [BoardComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(BoardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
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

    describe('handlePlaceTiles', () => {
        let tilePlacements: TilePlacement[];

        beforeEach(() => {
            tilePlacements = [
                { tile: { letter: 'A', value: 0 }, position: { row: 0, column: 0 } },
                { tile: { letter: 'B', value: 0 }, position: { row: 0, column: 1 } },
            ];
        });

        it('should add squareView to notAppliedSquares', () => {
            component['handlePlaceTiles'](tilePlacements);

            expect(component['notAppliedSquares'].length).toEqual(tilePlacements.length);
        });

        it('should place tiles on grid', () => {
            component['handlePlaceTiles'](tilePlacements);

            for (let i = 0; i < tilePlacements.length; ++i) {
                expect(component.squareGrid[0][i].square.tile).toBeDefined();
                expect(component.squareGrid[0][i].square.tile!.letter).toEqual(tilePlacements[i].tile.letter);
                expect(component.squareGrid[0][i].square.tile!.value).toEqual(tilePlacements[i].tile.value);
                expect(component.squareGrid[0][i].applied).toBeFalse();
            }
        });

        it('should reset notAppliedSquares values', () => {
            const squareView: SquareView = new SquareView(UNDEFINED_SQUARE, SQUARE_SIZE);
            squareView.square.tile = new Tile('A', 0);
            component['notAppliedSquares'] = [squareView];
            component['handlePlaceTiles']([]);

            expect(squareView.square.tile).toBeNull();
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

    describe('opponentPlacedTiles', () => {
        let tilePlacements: TilePlacement[];

        beforeEach(() => {
            tilePlacements = [
                { tile: { letter: 'A', value: 0 }, position: { row: 0, column: 0 } },
                { tile: { letter: 'B', value: 0 }, position: { row: 0, column: 1 } },
            ];
        });

        it('should add squareView to opponentPlacedTiles', () => {
            component['handleOpponentPlaceTiles'](tilePlacements);

            expect(component['opponentPlacedTiles'].length).toEqual(tilePlacements.length);
        });

        it('should reset notAppliedSquares values', () => {
            const squareView: SquareView = new SquareView(UNDEFINED_SQUARE, SQUARE_SIZE);
            squareView.square.tile = new Tile('A', 0);
            component['opponentPlacedTiles'] = [squareView];
            component['handleOpponentPlaceTiles']([]);

            expect(squareView.square.tile).toBeNull();
        });
    });
});
