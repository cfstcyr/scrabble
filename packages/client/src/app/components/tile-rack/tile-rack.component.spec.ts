/* eslint-disable max-lines */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { ActionData, ActionType, ExchangeActionPayload, PlaceActionPayload } from '@app/classes/actions/action-data';
import { Orientation } from '@app/classes/actions/orientation';
import Direction from '@app/classes/board-navigator/direction';
import { Message } from '@app/classes/communication/message';
import { Player } from '@app/classes/player';
import { LetterValue, Tile } from '@app/classes/tile';
import { IconComponent } from '@app/components/icon/icon.component';
import { TileComponent } from '@app/components/tile/tile.component';
import { ARROW_LEFT, ARROW_RIGHT, ESCAPE } from '@app/constants/components-constants';
import { MAX_TILES_PER_PLAYER } from '@app/constants/game-constants';
import { TileRackSelectType } from '@app/constants/tile-rack-select-type';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameService } from '@app/services';
import { GameViewEventManagerService } from '@app/services/game-view-event-manager-service/game-view-event-manager.service';
import { Random } from '@app/utils/random/random';
import { Observable, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RackTile, TileRackComponent } from './tile-rack.component';
import SpyObj = jasmine.SpyObj;

const DEFAULT_GAME_ID = 'gameId';
const DEFAULT_PLAYER_ID = 'playerId';

describe('TileRackComponent', () => {
    const EMPTY_TILE_RACK: RackTile[] = [];
    let gameServiceSpy: SpyObj<GameService>;
    let gameViewEventManagerSpy: SpyObj<GameViewEventManagerService>;
    let component: TileRackComponent;
    let fixture: ComponentFixture<TileRackComponent>;
    let handleUsedTileSpy: jasmine.Spy;

    beforeEach(() => {
        gameServiceSpy = jasmine.createSpyObj(
            'GameService',
            [
                'getLocalPlayer',
                'isLocalPlayerPlaying',
                'subscribeToUpdateTileRackEvent',
                'getTotalNumberOfTilesLeft',
                'getGameId',
                'getLocalPlayerId',
            ],
            ['playingTiles'],
        );
        gameServiceSpy.getGameId.and.returnValue(DEFAULT_GAME_ID);
        gameServiceSpy.getLocalPlayerId.and.returnValue(DEFAULT_PLAYER_ID);
        gameServiceSpy.getLocalPlayer.and.returnValue(new Player(DEFAULT_PLAYER_ID, 'name', []));
        gameServiceSpy.isLocalPlayerPlaying.and.returnValue(true);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        gameServiceSpy.getTotalNumberOfTilesLeft.and.returnValue(100);

        const tileRackUpdate$ = new Subject();
        const usedTiles$ = new Subject();
        const resetUsedTiles$ = new Subject();
        const message$ = new Subject<Message | null>();
        gameViewEventManagerSpy = jasmine.createSpyObj('GameViewEventManagerService', [
            'emitGameViewEvent',
            'subscribeToGameViewEvent',
            'getGameViewEventValue',
        ]);
        gameViewEventManagerSpy.emitGameViewEvent.and.callFake((eventType: string, payload?: any) => {
            switch (eventType) {
                case 'tileRackUpdate':
                    tileRackUpdate$.next();
                    break;
                case 'usedTiles':
                    usedTiles$.next();
                    break;
                case 'resetUsedTiles':
                    resetUsedTiles$.next();
                    break;
                case 'newMessage':
                    message$.next(payload);
            }
        });

        gameViewEventManagerSpy.subscribeToGameViewEvent.and.callFake((eventType: string, destroy$: Observable<boolean>, next: any): Subscription => {
            switch (eventType) {
                case 'tileRackUpdate':
                    return tileRackUpdate$.pipe(takeUntil(destroy$)).subscribe(next);
                case 'usedTiles':
                    return usedTiles$.pipe(takeUntil(destroy$)).subscribe(next);
                case 'resetUsedTiles':
                    return resetUsedTiles$.pipe(takeUntil(destroy$)).subscribe(next);
                case 'newMessage':
                    return message$.pipe(takeUntil(destroy$)).subscribe(next);
            }
            return new Subscription();
        });
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
                HttpClientTestingModule,
            ],
            declarations: [TileRackComponent, IconComponent, TileComponent],
            providers: [
                { provide: GameService, useValue: gameServiceSpy },
                { provide: GameViewEventManagerService, useValue: gameViewEventManagerSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TileRackComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        handleUsedTileSpy = spyOn<any>(component, 'handleUsedTiles');
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call updateTileRack when tileRackUpdate is received', () => {
        const spy = spyOn<any>(component, 'updateTileRack');
        gameViewEventManagerSpy.emitGameViewEvent('tileRackUpdate');
        expect(spy).toHaveBeenCalled();
    });
    it('should call handleUsedTiles on usedTiles event', () => {
        gameViewEventManagerSpy.emitGameViewEvent('usedTiles', undefined);
        expect(handleUsedTileSpy).toHaveBeenCalled();
    });

    it('should call resetUsedTiles on resetUsedTiles event', () => {
        const resetSpy: jasmine.Spy = spyOn<any>(component, 'resetUsedTiles').and.callFake(() => {
            return;
        });
        gameViewEventManagerSpy.emitGameViewEvent('resetUsedTiles');
        expect(resetSpy).toHaveBeenCalled();
    });

    it('Initializing TileRack with no Player in Game should return empty TileRack', () => {
        gameServiceSpy.getLocalPlayer.and.returnValue(undefined);
        component['updateTileRack'](undefined);
        expect(component.tiles).toEqual(EMPTY_TILE_RACK);
    });

    it('Initializing TileRack with player with no tiles should return empty TileRack', () => {
        const localPlayer: Player = new Player('', 'Test', []);

        gameServiceSpy.getLocalPlayer.and.returnValue(localPlayer);
        spyOn(localPlayer, 'getTiles').and.returnValue([]);

        component['updateTileRack'](localPlayer.id);

        expect(component.tiles).toEqual(EMPTY_TILE_RACK);
    });

    it('Initializing TileRack with player with tiles should return the player tiles', () => {
        const tiles: RackTile[] = [
            { letter: 'A', value: 10, isUsed: false, isSelected: false },
            { letter: 'B', value: 1, isUsed: false, isSelected: false },
            { letter: 'D', value: 1, isUsed: true, isSelected: false },
        ];
        const localPlayer: Player = new Player('', 'Test', [
            { letter: 'B', value: 1 },
            { letter: 'D', value: 1 },
            { letter: 'A', value: 10 },
        ]);

        component['tiles'] = tiles;
        gameServiceSpy.getLocalPlayer.and.returnValue(localPlayer);

        component['updateTileRack'](localPlayer.id);

        expect(component.tiles[0]).toBeTruthy();
    });

    it('should mark tiles as played but only those in playedTiles', () => {
        const tiles: RackTile[] = [
            { letter: 'A', value: 0, isUsed: false, isSelected: false },
            { letter: 'B', value: 0, isUsed: false, isSelected: false },
        ];
        const playedTiles: RackTile[] = [{ ...tiles[0] }, { letter: 'Z', value: 0, isUsed: false, isSelected: false }];
        component.tiles = tiles;
        const payload = { tiles: playedTiles, orientation: Orientation.Horizontal, startPosition: { row: 0, column: 9 } };

        handleUsedTileSpy.and.callThrough();
        component['handleUsedTiles'](payload);

        expect(tiles[0].isUsed).toBeTrue();
        expect(tiles[1].isUsed).toBeFalsy();
    });

    describe('selectTile', () => {
        it('should set tile.selected to true', () => {
            const type: TileRackSelectType = 'type' as TileRackSelectType;
            const tile: RackTile = { isSelected: false } as unknown as RackTile;

            component['selectTile'](type, tile);

            expect(tile.isSelected).toBeTrue();
        });

        it('should add tile to selectedTiles', () => {
            const type: TileRackSelectType = 'type' as TileRackSelectType;
            const tile: RackTile = {} as unknown as RackTile;

            component.selectedTiles = [];
            component['selectTile'](type, tile);

            expect(component.selectedTiles).toHaveSize(1);
            expect(component.selectedTiles).toContain(tile);
        });

        it('should call unselectTile if same tile and tile is selected', () => {
            const type: TileRackSelectType = 'type' as TileRackSelectType;
            const tile: RackTile = { isSelected: true } as unknown as RackTile;
            const spy = spyOn<any>(component, 'unselectTile');

            component['selectionType'] = type;
            component['selectTile'](type, tile);

            expect(spy).toHaveBeenCalledOnceWith(tile);
        });

        it('should return false', () => {
            const type: TileRackSelectType = 'type' as TileRackSelectType;
            const tile: RackTile = { isSelected: false } as unknown as RackTile;

            const result = component['selectTile'](type, tile);

            expect(result).toBeFalse();
        });

        it('should call unselectAll if type is move', () => {
            const type: TileRackSelectType = TileRackSelectType.Move;
            const tile: RackTile = {} as unknown as RackTile;
            const spy = spyOn(component, 'unselectAll');

            component['selectTile'](type, tile);

            expect(spy).toHaveBeenCalled();
        });

        it('should call unselectAll if type changes', () => {
            const type: TileRackSelectType = 'other-type' as TileRackSelectType;
            const tile: RackTile = {} as unknown as RackTile;
            const spy = spyOn(component, 'unselectAll');

            component['selectionType'] = 'type' as TileRackSelectType;
            component['selectTile'](type, tile);

            expect(spy).toHaveBeenCalled();
        });

        it('should NOT call unselectAll if type is not select and does not change', () => {
            const type: TileRackSelectType = 'exchange' as TileRackSelectType;
            const tile: RackTile = {} as unknown as RackTile;
            const spy = spyOn<any>(component, 'unselectAll');

            component['selectionType'] = 'exchange' as TileRackSelectType;
            component['selectTile'](type, tile);

            expect(spy).not.toHaveBeenCalled();
        });

        it('should return false if tile already selected', () => {
            const type: TileRackSelectType = 'type' as TileRackSelectType;
            const tile: RackTile = { isSelected: true } as unknown as RackTile;
            spyOn<any>(component, 'unselectTile');

            component['selectionType'] = type;
            const result = component['selectTile'](type, tile);

            expect(result).toBeFalse();
        });
    });

    describe('selectTileExchange', () => {
        it('should call selectType with type exchange', () => {
            const tile: RackTile = {} as unknown as RackTile;
            const spy = spyOn<any>(component, 'selectTile');

            component.selectTileToExchange(tile);

            expect(spy).toHaveBeenCalledOnceWith(TileRackSelectType.Exchange, tile);
        });
    });

    describe('selectTileMove', () => {
        it('should call selectType with type move', () => {
            const tile: RackTile = {} as unknown as RackTile;
            const spy = spyOn<any>(component, 'selectTile');

            component.selectTileToMove(tile);

            expect(spy).toHaveBeenCalledOnceWith(TileRackSelectType.Move, tile);
        });
    });

    describe('unselectTile', () => {
        it('should set tile.selected to false', () => {
            const tile: RackTile = { isSelected: true } as unknown as RackTile;

            component['unselectTile'](tile);

            expect(tile.isSelected).toBeFalse();
        });

        it('should remove tile from selectedTiles', () => {
            const tile: RackTile = { isSelected: true } as unknown as RackTile;

            component.selectedTiles = [tile];
            component['unselectTile'](tile);

            expect(component.selectedTiles).not.toContain(tile);
        });
    });

    describe('unselectAll', () => {
        it('should set tile.selected to false for all tiles', () => {
            const tiles: RackTile[] = [];
            for (let i = 0; i < 3; ++i) tiles.push({ isSelected: true } as RackTile);

            component.selectedTiles = tiles;
            component.unselectAll();

            tiles.forEach((tile) => expect(tile.isSelected).toBeFalse());
        });

        it('should remove all tiles from selectedTiles', () => {
            const tiles: RackTile[] = [];
            for (let i = 0; i < 3; ++i) tiles.push({ isSelected: true } as RackTile);

            component.selectedTiles = tiles;
            component.unselectAll();

            expect(component.selectedTiles).toHaveSize(0);
        });
    });

    describe('focus', () => {
        it('should call setActiveKeyboardComponent', () => {
            const spy = spyOn(component['focusableComponentService'], 'setActiveKeyboardComponent');

            component.focus();

            expect(spy).toHaveBeenCalledOnceWith(component);
        });
    });

    describe('onLoseFocusEvent', () => {
        it('should call unselectAll', () => {
            const spy = spyOn(component, 'unselectAll');

            component['onLoseFocusEvent']();

            expect(spy).toHaveBeenCalled();
        });
    });

    describe('onFocusableEvent', () => {
        it('should call unselectAll on ESC', () => {
            const event = { key: ESCAPE } as KeyboardEvent;
            const spy = spyOn(component, 'unselectAll');

            component['onFocusableEvent'](event);

            expect(spy).toHaveBeenCalled();
        });

        it('should call moveSelectedTile on arrow', () => {
            const tests: [arrow: string, direction: Direction][] = [
                [ARROW_LEFT, Direction.Left],
                [ARROW_RIGHT, Direction.Right],
            ];

            const spy = spyOn<any>(component, 'moveSelectedTile');

            for (const [arrow, direction] of tests) {
                const event = { key: arrow } as KeyboardEvent;

                component['onFocusableEvent'](event);

                expect(spy).toHaveBeenCalledOnceWith(direction);

                spy.calls.reset();
            }
        });

        it('should call selectTileFromKey if is key', () => {
            const event = { key: 'A' } as KeyboardEvent;
            const spy = spyOn<any>(component, 'selectTileFromKey');

            component['onFocusableEvent'](event);

            expect(spy).toHaveBeenCalledOnceWith(event.key);
        });
    });

    describe('selectTileFromKey', () => {
        let tiles: RackTile[];
        let selectTileMoveSpy: jasmine.Spy;

        beforeEach(() => {
            tiles = [
                { letter: 'A', isSelected: false },
                { letter: 'B', isSelected: false },
                { letter: 'C', isSelected: false },
                { letter: 'B', isSelected: false },
                { letter: 'D', isSelected: false },
                { letter: 'B', isSelected: false },
            ] as RackTile[];
            component.tiles = tiles;
            selectTileMoveSpy = spyOn(component, 'selectTileToMove');
        });

        it('should call selectTileMove', () => {
            const index = 0;
            const key = tiles[index].letter;

            component['selectTileFromKey'](key);

            expect(selectTileMoveSpy).toHaveBeenCalledOnceWith(tiles[index]);
        });

        it('should call selectTileMove with next tile with same letter', () => {
            tiles[1].isSelected = true;
            const index = 3;
            const key = tiles[index].letter;

            component['selectTileFromKey'](key);

            expect(selectTileMoveSpy).toHaveBeenCalledOnceWith(tiles[index]);
        });

        it('should call selectTileMove with next tile with same letter (2)', () => {
            tiles[3].isSelected = true;
            const index = 5;
            const key = tiles[index].letter;

            component['selectTileFromKey'](key);

            expect(selectTileMoveSpy).toHaveBeenCalledOnceWith(tiles[index]);
        });

        it('should not call selectTileMove if no tile matches', () => {
            const key = 'not a letter';

            component['selectTileFromKey'](key);

            expect(selectTileMoveSpy).not.toHaveBeenCalled();
        });
    });

    describe('moveSelectedTile', () => {
        const tests: [selected: number, direction: Direction, expected: LetterValue[]][] = [
            [1, Direction.Left, ['B', 'A', 'C', 'D']],
            [1, Direction.Right, ['A', 'C', 'B', 'D']],
            [0, Direction.Left, ['B', 'C', 'D', 'A']],
            [3, Direction.Right, ['D', 'A', 'B', 'C']],
        ];
        let tiles: RackTile[];

        beforeEach(() => {
            tiles = [
                { letter: 'A', isSelected: false },
                { letter: 'B', isSelected: false },
                { letter: 'C', isSelected: false },
                { letter: 'D', isSelected: false },
            ] as RackTile[];
            component.tiles = tiles;
        });

        for (let i = 0; i < tests.length; ++i) {
            it(`should move selected tile (${i + 1})`, () => {
                const [selected, direction, expected] = tests[i];

                component.selectTileToMove(tiles[selected]);

                component['moveSelectedTile'](direction);

                expect(component.tiles.map((t) => t.letter)).toEqual(expected);
            });
        }

        it('should not change tiles if selection type is not move', () => {
            const expected = [...tiles];

            component.selectTileToMove(tiles[0]);
            component.selectionType = TileRackSelectType.Exchange;

            component['moveSelectedTile'](Direction.Right);

            expect(component.tiles.map((t) => t.letter)).toEqual(expected.map((t) => t.letter));
        });

        it('should not change tiles if selectedTiles is empty', () => {
            const expected = [...tiles];

            component.selectTileToMove(tiles[0]);
            component.selectedTiles = [];

            component['moveSelectedTile'](Direction.Right);

            expect(component.tiles.map((t) => t.letter)).toEqual(expected.map((t) => t.letter));
        });
    });

    describe('canExchangeTiles', () => {
        let isLocalPlayerPlayingSpy: jasmine.Spy;

        beforeEach(() => {
            component.selectionType = TileRackSelectType.Exchange;
            component.selectedTiles = [{}, {}] as RackTile[];
            isLocalPlayerPlayingSpy = gameServiceSpy.isLocalPlayerPlaying.and.returnValue(true);
            component['actionService'].hasActionBeenPlayed = false;
        });

        it('should be true if can exchange', () => {
            expect(component.canExchangeTiles()).toBeTrue();
        });

        it('should be false if selectionType is not exchange', () => {
            component.selectionType = TileRackSelectType.Move;
            expect(component.canExchangeTiles()).toBeFalse();
        });

        it('should be false if selectedTiles is empty', () => {
            component.selectedTiles = [];
            expect(component.canExchangeTiles()).toBeFalse();
        });

        it('should be false if is not local player playing', () => {
            isLocalPlayerPlayingSpy.and.returnValue(false);
            expect(component.canExchangeTiles()).toBeFalse();
        });

        it('should be false if is less than 7 tiles', () => {
            gameServiceSpy.getTotalNumberOfTilesLeft.and.returnValue(MAX_TILES_PER_PLAYER - 1);
            expect(component.canExchangeTiles()).toBeFalse();
        });

        it('should be false if action has been played', () => {
            component['actionService'].hasActionBeenPlayed = true;
            expect(component.canExchangeTiles()).toBeFalse();
            component['actionService'].hasActionBeenPlayed = false;
        });
    });

    describe('exchangeTiles', () => {
        const fakePayload = { fake: 'payload' };
        const fakeData = { fake: 'data' };
        let createPayloadSpy: jasmine.Spy;
        let createActionDataSpy: jasmine.Spy;
        let sendAction: jasmine.Spy;
        let unselectAllSpy: jasmine.Spy;
        let canExchangeTile: jasmine.Spy;

        beforeEach(() => {
            createPayloadSpy = spyOn(component['actionService'], 'createExchangeActionPayload').and.returnValue(
                fakePayload as unknown as ExchangeActionPayload,
            );
            createActionDataSpy = spyOn(component['actionService'], 'createActionData').and.returnValue(fakeData as unknown as ActionData);
            sendAction = spyOn(component['actionService'], 'sendAction').and.callFake(() => {
                return;
            });
            unselectAllSpy = spyOn(component, 'unselectAll');
            canExchangeTile = spyOn(component, 'canExchangeTiles').and.returnValue(true);
            component.selectedTiles = [{ isUsed: false }, { isPlayed: false }] as RackTile[];
        });

        it('should send exchange action', () => {
            component.exchangeTiles();
            expect(createPayloadSpy).toHaveBeenCalledWith(component.selectedTiles);
            expect(createActionDataSpy).toHaveBeenCalledWith(ActionType.EXCHANGE, fakePayload);
            expect(sendAction).toHaveBeenCalledOnceWith(DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, fakeData);
        });

        it('should set all selectedTiles as played', () => {
            const tiles = [...component.selectedTiles];
            component.exchangeTiles();
            expect(tiles.every((tile) => tile.isUsed)).toBeTrue();
        });

        it('should call unselectAll', () => {
            component.exchangeTiles();
            expect(unselectAllSpy).toHaveBeenCalled();
        });

        it('should not send action if cannot exchange', () => {
            canExchangeTile.and.returnValue(false);
            component.exchangeTiles();
            expect(sendAction).not.toHaveBeenCalled();
        });
    });

    describe('onScroll', () => {
        it('should call moveSelectedTile', () => {
            const value = 1;
            const spy = spyOn<any>(component, 'moveSelectedTile');

            component.onScroll({ deltaY: value } as WheelEvent);

            expect(spy).toHaveBeenCalledOnceWith(value);
        });
    });

    describe('handleUsedTiles', () => {
        let payload: PlaceActionPayload;

        beforeEach(() => {
            payload = {} as PlaceActionPayload;
            handleUsedTileSpy.and.callThrough();
        });

        it('should make tiles as used', () => {
            component.tiles = [
                { letter: 'A', isUsed: false },
                { letter: 'B', isUsed: false },
                { letter: 'C', isUsed: false },
            ] as RackTile[];

            payload.tiles = [{ letter: 'A' }, { letter: 'B' }] as Tile[];

            component['handleUsedTiles'](payload);

            for (const tile of payload.tiles) {
                expect(component.tiles.find((t) => t.letter === tile.letter)?.isUsed).toBeTrue();
            }
        });

        it('should mark tile as unused if not in payload', () => {
            component.tiles = [{ letter: 'A', isUsed: true }] as RackTile[];
            payload.tiles = [];

            component['handleUsedTiles'](payload);

            for (const tile of component.tiles) {
                expect(tile.isUsed).toBeFalse();
            }
        });

        it('should only mark one tile as used if two with same letter', () => {
            component.tiles = [
                { letter: 'A', isUsed: false },
                { letter: 'A', isUsed: true },
            ] as RackTile[];

            payload.tiles = [{ letter: 'A' }] as Tile[];

            component['handleUsedTiles'](payload);

            expect(component.tiles[0].isUsed).toBeTrue();
            expect(component.tiles[1].isUsed).toBeFalse();
        });

        it('should not mark any tiles if paylod is undefined', () => {
            component.tiles = [{ letter: 'A', isUsed: false }] as RackTile[];

            component['handleUsedTiles'](undefined);

            expect(component.tiles[0].isUsed).toBeFalse();
        });
    });

    it('resetUsedTiles should reset all used tiles to false', () => {
        component.tiles = [
            { letter: 'A', isUsed: true },
            { letter: 'B', isUsed: true },
            { letter: 'C', isUsed: true },
        ] as RackTile[];

        component['resetUsedTiles']();

        for (const tile of component.tiles) {
            expect(tile.isUsed).toBeFalse();
        }
    });

    describe('updateTileRack', () => {
        const DEFAULT_TILES: Tile[] = [
            new Tile('A' as LetterValue, 1),
            new Tile('B' as LetterValue, 1),
            new Tile('C' as LetterValue, 1),
            new Tile('C' as LetterValue, 1),
            new Tile('E' as LetterValue, 1),
            new Tile('E' as LetterValue, 1),
            new Tile('*' as LetterValue, 0, true),
        ];

        it('should call right functions', () => {
            gameServiceSpy.getLocalPlayer.and.returnValue(new Player(DEFAULT_PLAYER_ID, 'name', DEFAULT_TILES));
            gameServiceSpy.getLocalPlayerId.and.returnValue(DEFAULT_PLAYER_ID);
            const createRackTileSpy = spyOn<any>(component, 'createRackTile');

            component['updateTileRack'](DEFAULT_PLAYER_ID);

            expect(gameServiceSpy.getLocalPlayer).toHaveBeenCalled();
            expect(gameServiceSpy.getLocalPlayerId).toHaveBeenCalled();
            expect(createRackTileSpy).toHaveBeenCalled();
        });
    });

    describe('createRackTile', () => {
        const DEFAULT_TILE: Tile = new Tile('A' as LetterValue, 1);
        const DEFAULT_RACK_TILE: RackTile = { letter: 'A', value: 1, isUsed: true, isSelected: true };

        it('should set isUsed to false if rackTile is undefined && rackTile.isUsed is true', () => {
            expect(component['createRackTile'](DEFAULT_TILE, undefined as unknown as RackTile).isUsed).toBeFalse();
        });

        it('should set isUsed to false if rackTile is defined && rackTile.isUsed is false', () => {
            expect(component['createRackTile'](DEFAULT_TILE, { ...DEFAULT_RACK_TILE, isUsed: false }).isUsed).toBeFalse();
        });

        it('should set isSelected to true if rackTile is defined && rackTile.isSelected is true', () => {
            expect(component['createRackTile'](DEFAULT_TILE, DEFAULT_RACK_TILE).isSelected).toBeTrue();
        });

        it('should set isSelected to false if rackTile is defined && rackTile.isSelected is false', () => {
            expect(component['createRackTile'](DEFAULT_TILE, { ...DEFAULT_RACK_TILE, isSelected: false }).isSelected).toBeFalse();
        });
    });

    describe('shuffleTiles', () => {
        it('should call randomize with tiles', async () => {
            const tiles = [1, 2, 3];
            const random = [2, 1, 3];
            (component.tiles as unknown) = tiles;

            const spy = spyOn(Random, 'randomize').and.returnValue(random);

            await component.shuffleTiles();

            expect(spy).toHaveBeenCalledWith(tiles);
            expect(component.tiles as unknown).toEqual(random);

            spy.and.callThrough();
        });
    });
});
