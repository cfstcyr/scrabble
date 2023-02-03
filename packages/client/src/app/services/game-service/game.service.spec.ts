/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { GameUpdateData, PlayerData } from '@app/classes/communication';
import { InitializeGameData, StartGameData } from '@app/classes/communication/game-config';
import { GameObjectivesData } from '@app/classes/communication/game-objectives-data';
import { Message } from '@app/classes/communication/message';
import { Player } from '@app/classes/player';
import { PlayerContainer } from '@app/classes/player/player-container';
import { Round } from '@app/classes/round/round';
import { Square } from '@app/classes/square';
import { TileReserveData } from '@app/classes/tile/tile.types';
import { INITIAL_MESSAGE } from '@app/constants/controller-constants';
import { TEST_DICTIONARY } from '@app/constants/controller-test-constants';
import { SYSTEM_ERROR_ID } from '@app/constants/game-constants';
import { GameMode } from '@app/constants/game-mode';
import { GameType } from '@app/constants/game-type';
import { GameDispatcherController } from '@app/controllers/game-dispatcher-controller/game-dispatcher.controller';
import { BoardService, GameService } from '@app/services';
import { GameViewEventManagerService } from '@app/services/game-view-event-manager-service/game-view-event-manager.service';
import { ObjectivesManagerService } from '@app/services/objectives-manager-service/objectives-manager.service';
import RoundManagerService from '@app/services/round-manager-service/round-manager.service';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import SpyObj = jasmine.SpyObj;

const DEFAULT_PLAYER_ID = 'cov-id';
const DEFAULT_GAME_ID = 'game id';
const DEFAULT_MESSAGE = { ...INITIAL_MESSAGE, gameId: DEFAULT_GAME_ID };

const DEFAULT_SQUARE: Omit<Square, 'position'> = { tile: null, scoreMultiplier: null, wasMultiplierUsed: false, isCenter: false };
const DEFAULT_GRID_SIZE = 8;
const DEFAULT_PLAYER_1 = {
    name: 'phineas',
    id: 'id-1',
    score: 0,
    tiles: [],
    getTiles: () => {
        return [];
    },
    updatePlayerData: () => {
        return;
    },
};
const DEFAULT_PLAYER_2 = { name: 'ferb', id: 'id-2', score: 0, tiles: [] };

@Component({
    template: '',
})
class TestComponent {}

describe('GameService', () => {
    let service: GameService;
    let boardServiceSpy: SpyObj<BoardService>;
    let roundManagerSpy: SpyObj<RoundManagerService>;
    let gameDispatcherControllerSpy: SpyObj<GameDispatcherController>;
    let gameViewEventManagerSpy: SpyObj<GameViewEventManagerService>;
    let objectiveManagerSpy: SpyObj<ObjectivesManagerService>;

    beforeEach(() => {
        boardServiceSpy = jasmine.createSpyObj('BoardService', ['initializeBoard', 'updateBoard']);
        objectiveManagerSpy = jasmine.createSpyObj('ObjectivesManagerService', ['updateObjectives', 'initialize']);
        roundManagerSpy = jasmine.createSpyObj('RoundManagerService', [
            'convertRoundDataToRound',
            'startRound',
            'updateRound',
            'getActivePlayer',
            'initialize',
            'resetTimerData',
            'continueRound',
            'initializeEvents',
        ]);
        gameDispatcherControllerSpy = jasmine.createSpyObj('GameDispatcherController', ['subscribeToInitializeGame']);
        gameDispatcherControllerSpy['initializeGame$'] = new BehaviorSubject<InitializeGameData | undefined>(undefined);
        gameDispatcherControllerSpy.subscribeToInitializeGame.and.callFake(
            (serviceDestroyed$: Subject<boolean>, callback: (value: InitializeGameData | undefined) => void) => {
                gameDispatcherControllerSpy['initializeGame$'].pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
            },
        );

        const tileRackUpdate$ = new Subject();
        const message$ = new Subject();
        const reRender$ = new Subject();
        const noActiveGame$ = new Subject();
        const resetServices$ = new Subject();
        const endOfGame$ = new Subject();
        gameViewEventManagerSpy = jasmine.createSpyObj('GameViewEventManagerService', ['emitGameViewEvent', 'subscribeToGameViewEvent']);
        gameViewEventManagerSpy.emitGameViewEvent.and.callFake((eventType: string) => {
            switch (eventType) {
                case 'tileRackUpdate':
                    tileRackUpdate$.next();
                    break;
                case 'reRender':
                    reRender$.next();
                    break;
                case 'noActiveGame':
                    noActiveGame$.next();
                    break;
                case 'newMessage':
                    message$.next();
                    break;
                case 'resetServices':
                    resetServices$.next();
                    break;
                case 'endOfGame':
                    endOfGame$.next();
                    break;
            }
        });

        gameViewEventManagerSpy.subscribeToGameViewEvent.and.callFake((eventType: string, destroy$: Observable<boolean>, next: any): Subscription => {
            switch (eventType) {
                case 'tileRackUpdate':
                    return tileRackUpdate$.pipe(takeUntil(destroy$)).subscribe(next);
                case 'reRender':
                    return reRender$.pipe(takeUntil(destroy$)).subscribe(next);
                case 'noActiveGame':
                    return noActiveGame$.pipe(takeUntil(destroy$)).subscribe(next);
                case 'newMessage':
                    return message$.pipe(takeUntil(destroy$)).subscribe(next);
                case 'resetServices':
                    return resetServices$.pipe(takeUntil(destroy$)).subscribe(next);
                case 'endOfGame':
                    return resetServices$.pipe(takeUntil(destroy$)).subscribe(next);
            }
            return new Subscription();
        });
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                RouterTestingModule.withRoutes([
                    { path: 'game', component: TestComponent },
                    { path: 'other', component: TestComponent },
                ]),
                MatSnackBarModule,
            ],
            providers: [
                { provide: BoardService, useValue: boardServiceSpy },
                { provide: RoundManagerService, useValue: roundManagerSpy },
                { provide: GameDispatcherController, useValue: gameDispatcherControllerSpy },
                { provide: GameViewEventManagerService, useValue: gameViewEventManagerSpy },
                { provide: ObjectivesManagerService, useValue: objectiveManagerSpy },
            ],
        });
        service = TestBed.inject(GameService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('Constructor', () => {
        it('should call handleNewMessage if new message from gameController is Message', () => {
            const spy = spyOn<any>(service, 'handleNewMessage');
            service['gameController']['newMessage$'].next(DEFAULT_MESSAGE);
            expect(spy).toHaveBeenCalled();
        });

        it('should NOT call handleNewMessage if new message from gameController is null', () => {
            const spy = spyOn<any>(service, 'handleNewMessage');
            service['gameController']['newMessage$'].next(null);
            expect(spy).not.toHaveBeenCalled();
        });

        it('should call resetServiceData if resetServices event is received', () => {
            const resetDataSpy = spyOn(service, 'resetServiceData').and.callFake(() => {
                return;
            });
            gameViewEventManagerSpy.emitGameViewEvent('resetServices');
            expect(resetDataSpy).toHaveBeenCalled();
        });
    });

    describe('ngOnDestroy', () => {
        let serviceDestroyed$py: SpyObj<Subject<boolean>>;

        beforeEach(() => {
            serviceDestroyed$py = jasmine.createSpyObj('Subject', ['next', 'complete']);
            service['serviceDestroyed$'] = serviceDestroyed$py;
        });

        it('should call serviceDestroyed$.next', () => {
            service.ngOnDestroy();
            expect(serviceDestroyed$py.next).toHaveBeenCalledOnceWith(true);
        });

        it('should call serviceDestroyed$.complete', () => {
            service.ngOnDestroy();
            expect(serviceDestroyed$py.complete).toHaveBeenCalled();
        });
    });

    describe('handleInitializeGame', () => {
        let initializeGameSpy: jasmine.Spy;

        beforeEach(() => {
            initializeGameSpy = spyOn<any>(service, 'initializeGame').and.callFake(() => {
                return;
            });
        });

        it('should do nothing if initializeGameData is undefined', async () => {
            await service.handleInitializeGame(undefined);
            expect(initializeGameSpy).not.toHaveBeenCalled();
        });

        it('should call initializeGame and emit gameInitialized if initializeGameData is defined', async () => {
            await service.handleInitializeGame({} as InitializeGameData);

            expect(initializeGameSpy).toHaveBeenCalled();
            expect(gameViewEventManagerSpy.emitGameViewEvent).toHaveBeenCalledWith('gameInitialized', {} as InitializeGameData);
        });
    });

    describe('initializeGame', () => {
        let defaultGameData: StartGameData;

        beforeEach(() => {
            defaultGameData = {
                player1: DEFAULT_PLAYER_1,
                player2: DEFAULT_PLAYER_2,
                gameType: GameType.Classic,
                gameMode: GameMode.Multiplayer,
                maxRoundTime: 1,
                dictionary: TEST_DICTIONARY,
                gameId: 'game-id',
                board: new Array(DEFAULT_GRID_SIZE).map((_, y) => {
                    return new Array(DEFAULT_GRID_SIZE).map((__, x) => ({ ...DEFAULT_SQUARE, position: { row: y, column: x } }));
                }),
                tileReserve: [],
                round: {
                    playerData: DEFAULT_PLAYER_1,
                    startTime: new Date(),
                    limitTime: new Date(),
                    completedTime: null,
                },
            };

            roundManagerSpy.getActivePlayer.and.returnValue({ id: DEFAULT_PLAYER_ID } as Player);
        });

        it('should set gameId', async () => {
            expect(service.getGameId()).not.toBeDefined();
            await service['initializeGame'](DEFAULT_PLAYER_ID, defaultGameData);
            expect(service.getGameId()).toEqual(defaultGameData.gameId);
        });

        it('should set player 1', async () => {
            await service['initializeGame'](DEFAULT_PLAYER_ID, defaultGameData);
            expect(service['playerContainer']!.getPlayer(1)).toBeDefined();
        });

        it('should set player 2', async () => {
            await service['initializeGame'](DEFAULT_PLAYER_ID, defaultGameData);
            expect(service['playerContainer']!.getPlayer(2)).toBeDefined();
        });

        it('should initialize roundManager', async () => {
            await service['initializeGame'](DEFAULT_PLAYER_ID, defaultGameData);
            expect(roundManagerSpy.initialize).toHaveBeenCalled();
        });

        it('should set tileReserve', async () => {
            expect(service.tileReserve).not.toBeDefined();
            await service['initializeGame'](DEFAULT_PLAYER_ID, defaultGameData);
            expect(service.tileReserve).toEqual(defaultGameData.tileReserve);
        });

        it('should call initializeBoard', async () => {
            await service['initializeGame'](DEFAULT_PLAYER_ID, defaultGameData);
            expect(boardServiceSpy.initializeBoard).toHaveBeenCalledWith(defaultGameData.board);
        });

        it('should call startRound', fakeAsync(() => {
            const router: Router = TestBed.inject(Router);
            router.navigateByUrl('other');
            tick();
            service['initializeGame'](DEFAULT_PLAYER_ID, defaultGameData);
            expect(roundManagerSpy.startRound).toHaveBeenCalled();
        }));

        it('should call initialize', fakeAsync(() => {
            const router: Router = TestBed.inject(Router);
            router.navigateByUrl('other');
            tick();
            service['initializeGame'](DEFAULT_PLAYER_ID, defaultGameData);
            expect(roundManagerSpy.startRound).toHaveBeenCalled();
        }));

        it('should call navigateByUrl', fakeAsync(() => {
            const router: Router = TestBed.inject(Router);
            router.navigateByUrl('other');
            tick();
            const spy = spyOn(service['router'], 'navigateByUrl');
            service['initializeGame'](DEFAULT_PLAYER_ID, defaultGameData);
            expect(spy).toHaveBeenCalledWith('game');
        }));

        it('should call reconnectReinitialize', fakeAsync(() => {
            const router: Router = TestBed.inject(Router);
            router.navigateByUrl('game');
            tick();
            const spy = spyOn<any>(service, 'reconnectReinitialize').and.callFake(() => {
                return;
            });
            service['initializeGame'](DEFAULT_PLAYER_ID, defaultGameData);
            expect(spy).toHaveBeenCalled();
        }));

        it('should call startRound', async () => {
            await service['initializeGame'](DEFAULT_PLAYER_ID, defaultGameData);
            expect(roundManagerSpy.startRound).toHaveBeenCalled();
        });

        it('should call navigateByUrl', async () => {
            const spy = spyOn(service['router'], 'navigateByUrl');
            await service['initializeGame'](DEFAULT_PLAYER_ID, defaultGameData);
            expect(spy).toHaveBeenCalledWith('game');
        });
    });

    describe('handleUpdatePlayerData', () => {
        let emitSpy: unknown;

        beforeEach(() => {
            emitSpy = gameViewEventManagerSpy.emitGameViewEvent;
        });

        it('should call playerContainer.updatePlayersData if it is defined', () => {
            service['playerContainer'] = new PlayerContainer(DEFAULT_PLAYER_1.id);
            const updatedData: PlayerData = { id: 'id', name: 'new-name' };
            // eslint-disable-next-line no-unused-vars
            const spy = spyOn(service['playerContainer'], 'updatePlayersData').and.callFake((...playerDatas: PlayerData[]) => {
                return service['playerContainer']!;
            });

            service['handleUpdatePlayerData'](updatedData);
            expect(spy).toHaveBeenCalledWith(updatedData);
        });

        it('should NOT call playerContainer.updatePlayersData if playerContainer is NOT defined', () => {
            service['playerContainer'] = new PlayerContainer(DEFAULT_PLAYER_1.id);
            // eslint-disable-next-line no-unused-vars
            const spy = spyOn<any>(service['playerContainer'], 'updatePlayersData').and.callFake((...playerDatas: PlayerData[]) => {
                return service['playerContainer']!;
            });

            service['playerContainer'] = undefined as unknown as PlayerContainer;
            const updatedData: PlayerData = { id: 'id', name: 'new-name' };

            service['handleUpdatePlayerData'](updatedData);
            expect(spy).not.toHaveBeenCalled();
        });

        it('should call emitGameViewEvent with tileRackUpdate', () => {
            service['playerContainer'] = new PlayerContainer(DEFAULT_PLAYER_1.id);
            const updatedData: PlayerData = { id: 'id', name: 'new-name' };

            service['handleUpdatePlayerData'](updatedData);
            expect(emitSpy).toHaveBeenCalledWith('tileRackUpdate', updatedData.id);
        });
    });

    it('handleTileReserveUpdate should assign new tileReserve to the service', () => {
        const oldTileReserve: TileReserveData[] = [{ letter: 'A', amount: 1 }];
        const newTileReserve: TileReserveData[] = [{ letter: 'B', amount: 1 }];

        service['tileReserve'] = oldTileReserve;
        service['handleTileReserveUpdate'](newTileReserve);

        expect(service['tileReserve']).toEqual(newTileReserve);
        expect(service['tileReserve'] === newTileReserve).toBeFalse();
    });

    describe('reconnectReinitialize', () => {
        let defaultGameData: StartGameData;

        beforeEach(() => {
            service['playerContainer'] = new PlayerContainer(DEFAULT_PLAYER_1.id);
            service['playerContainer']['players'].set(1, new Player(DEFAULT_PLAYER_1.id, DEFAULT_PLAYER_1.name, DEFAULT_PLAYER_1.tiles));
            service['playerContainer']['players'].set(2, new Player(DEFAULT_PLAYER_2.id, DEFAULT_PLAYER_2.name, DEFAULT_PLAYER_2.tiles));
            defaultGameData = {
                player1: DEFAULT_PLAYER_1,
                player2: DEFAULT_PLAYER_2,
                gameType: GameType.Classic,
                gameMode: GameMode.Multiplayer,
                maxRoundTime: 1,
                dictionary: TEST_DICTIONARY,
                gameId: 'game-id',
                board: new Array(DEFAULT_GRID_SIZE).map((_, y) => {
                    return new Array(DEFAULT_GRID_SIZE).map((__, x) => ({ ...DEFAULT_SQUARE, position: { row: y, column: x } }));
                }),
                tileReserve: [],
                round: {
                    playerData: DEFAULT_PLAYER_1,
                    startTime: new Date(),
                    limitTime: new Date(),
                    completedTime: null,
                },
            };
        });

        it('should create player', () => {
            const player1Spy = spyOn(service['playerContainer']!.getPlayer(1), 'updatePlayerData');
            const player2Spy = spyOn(service['playerContainer']!.getPlayer(2), 'updatePlayerData');
            const emitSpy = gameViewEventManagerSpy.emitGameViewEvent;
            service['reconnectReinitialize'](defaultGameData);

            expect(player1Spy).toHaveBeenCalled();
            expect(player2Spy).toHaveBeenCalled();
            expect(emitSpy).toHaveBeenCalledWith('reRender');
            expect(emitSpy).toHaveBeenCalledWith('tileRackUpdate', DEFAULT_PLAYER_1.id);
            expect(boardServiceSpy.updateBoard).toHaveBeenCalled();
            expect(roundManagerSpy.continueRound).toHaveBeenCalled();
        });

        it('should update player if playerContainer is defined', () => {
            service['playerContainer'] = new PlayerContainer(DEFAULT_PLAYER_ID);
            const spy = spyOn<any>(service['playerContainer'], 'updatePlayersData');

            service['reconnectReinitialize'](defaultGameData);

            expect(spy).toHaveBeenCalled();
        });

        it('should not update player if playerContainer is undefined', () => {
            service['playerContainer'] = undefined;
            const spy = spyOn<any>(PlayerContainer.prototype, 'updatePlayersData');

            service['reconnectReinitialize'](defaultGameData);

            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('handleGameUpdate', () => {
        let player1: Player;
        let player2: Player;

        let gameUpdateData: GameUpdateData;
        let updateTileRackEventEmitSpy: jasmine.Spy;

        beforeEach(() => {
            gameUpdateData = {};
            service['playerContainer'] = new PlayerContainer(DEFAULT_PLAYER_1.id);
            player1 = new Player(DEFAULT_PLAYER_1.id, DEFAULT_PLAYER_1.name, DEFAULT_PLAYER_1.tiles);
            player2 = new Player(DEFAULT_PLAYER_2.id, DEFAULT_PLAYER_2.name, DEFAULT_PLAYER_2.tiles);
            service['playerContainer']['players'].set(1, player1);
            service['playerContainer']['players'].set(2, player2);

            updateTileRackEventEmitSpy = gameViewEventManagerSpy.emitGameViewEvent;
        });

        it('should call updatePlayerDate and emit with player1 if defined', () => {
            const spy = spyOn(player1, 'updatePlayerData');
            gameUpdateData.player1 = DEFAULT_PLAYER_1;
            service['handleGameUpdate'](gameUpdateData);
            expect(spy).toHaveBeenCalledWith(DEFAULT_PLAYER_1);
            expect(updateTileRackEventEmitSpy).toHaveBeenCalled();
        });

        it('should not call updatePlayerDate and emit with player1 if undefined', () => {
            const spy = spyOn(player1, 'updatePlayerData');
            service['handleGameUpdate'](gameUpdateData);
            expect(spy).not.toHaveBeenCalledWith(DEFAULT_PLAYER_1);
            expect(updateTileRackEventEmitSpy).not.toHaveBeenCalledWith('tileRackUpdate');
        });

        it('should call updatePlayerDate and emit with player2 if defined', () => {
            const spy = spyOn(player2, 'updatePlayerData');
            gameUpdateData.player2 = DEFAULT_PLAYER_2;
            service['handleGameUpdate'](gameUpdateData);
            expect(spy).toHaveBeenCalledWith(DEFAULT_PLAYER_2);
            expect(updateTileRackEventEmitSpy).toHaveBeenCalled();
        });

        it('should not call updatePlayerDate and emit with player2 if undefined', () => {
            const spy = spyOn(player2, 'updatePlayerData');
            gameUpdateData.player2 = undefined as unknown as PlayerData;
            service['handleGameUpdate'](gameUpdateData);
            expect(spy).not.toHaveBeenCalledWith(DEFAULT_PLAYER_2);
            expect(updateTileRackEventEmitSpy).not.toHaveBeenCalledWith('tileRackUpdate');
        });

        it('should call updateBoard if board is defined', () => {
            gameUpdateData.board = [];
            service['handleGameUpdate'](gameUpdateData);
            expect(boardServiceSpy.updateBoard).toHaveBeenCalledWith(gameUpdateData.board);
        });

        it('should not call updateBoard if board is undefined', () => {
            service['handleGameUpdate'](gameUpdateData);
            expect(boardServiceSpy.updateBoard).not.toHaveBeenCalled();
        });

        it('should call convertRoundDataToRound and updateRound if round is defined', () => {
            const round: Round = { player: player1, startTime: new Date(), limitTime: new Date(), completedTime: null };
            roundManagerSpy.convertRoundDataToRound.and.returnValue(round);
            spyOn(service, 'isLocalPlayerPlaying').and.returnValue(true);

            gameUpdateData.round = { playerData: DEFAULT_PLAYER_1, startTime: new Date(), limitTime: new Date(), completedTime: null };
            service['handleGameUpdate'](gameUpdateData);
            expect(roundManagerSpy.convertRoundDataToRound).toHaveBeenCalled();
            expect(roundManagerSpy.updateRound).toHaveBeenCalledWith(round);
        });

        it('should not call convertRoundDataToRound and updateRound if round is defined', () => {
            const round: Round = { player: player1, startTime: new Date(), limitTime: new Date(), completedTime: null };
            roundManagerSpy.convertRoundDataToRound.and.returnValue(round);
            service['handleGameUpdate'](gameUpdateData);
            expect(roundManagerSpy.convertRoundDataToRound).not.toHaveBeenCalled();
            expect(roundManagerSpy.updateRound).not.toHaveBeenCalledWith(round);
        });

        it('should update tileReserve, tileReserveTotal and emit if tileReserve and tilReserveTotal are defined', () => {
            service.tileReserve = [];

            gameUpdateData.tileReserve = [];
            service['handleGameUpdate'](gameUpdateData);

            expect(service.tileReserve).toEqual(gameUpdateData.tileReserve);
        });

        it('should not update tileReserve, tileReserveTotal and emit if tileReserve or tilReserveTotal are undefined', () => {
            const originalTileReserve: TileReserveData[] = [];
            service.tileReserve = originalTileReserve;

            gameUpdateData.tileReserve = undefined;
            service['handleGameUpdate'](gameUpdateData);

            expect(service.tileReserve).toEqual(originalTileReserve);
        });

        it('should update gameObjective, if gameObjective are defined', () => {
            gameUpdateData.gameObjective = {} as GameObjectivesData;
            objectiveManagerSpy.updateObjectives.and.returnValue();

            service['handleGameUpdate'](gameUpdateData);

            expect(objectiveManagerSpy.updateObjectives).toHaveBeenCalled();
        });

        it('should not update gameObjective, if gameObjective are undefined', () => {
            gameUpdateData.gameObjective = undefined;
            service['handleGameUpdate'](gameUpdateData);
            expect(objectiveManagerSpy.updateObjectives).not.toHaveBeenCalled();
        });

        it('should call handleGameOver with winnerNames if game is over and they are defined', () => {
            const spy = spyOn<any>(service, 'handleGameOver');
            const winners = ['Mathilde'];
            gameUpdateData.isGameOver = true;
            gameUpdateData.winners = winners;
            service['handleGameUpdate'](gameUpdateData);
            expect(spy).toHaveBeenCalledWith(winners);
        });

        it('should call gameOver if gameOver with [] if no winnerNames are defined', () => {
            const spy = spyOn<any>(service, 'handleGameOver');
            gameUpdateData.isGameOver = true;
            service['handleGameUpdate'](gameUpdateData);
            expect(spy).toHaveBeenCalledWith([]);
        });

        it('should not call gameOver if gameOver is false or undefined', () => {
            const spy = spyOn<any>(service, 'handleGameOver');
            service['handleGameUpdate'](gameUpdateData);
            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('handleNewMessage', () => {
        it('should call emit newMessaget', () => {
            const spy = gameViewEventManagerSpy.emitGameViewEvent;

            const message: Message = {} as Message;
            service['handleNewMessage'](message);
            expect(spy).toHaveBeenCalledWith('newMessage', message);
        });

        it('should call emitGameViewEvent if sender id is system-error', () => {
            const spy = gameViewEventManagerSpy.emitGameViewEvent;

            const message: Message = { senderId: SYSTEM_ERROR_ID } as Message;
            service['handleNewMessage'](message);

            expect(spy).toHaveBeenCalledWith('resetUsedTiles');
        });

        it('should not call emitGameViewEvent if sender id is not system-error', () => {
            const spy = gameViewEventManagerSpy.emitGameViewEvent;

            const message: Message = {} as Message;
            service['handleNewMessage'](message);

            expect(spy).not.toHaveBeenCalledWith('usedTiles', undefined);
        });
    });

    describe('getPlayingPlayerId', () => {
        it('should return id or round manager active player', () => {
            const expected = 'expected-id';
            roundManagerSpy.getActivePlayer.and.returnValue({ id: expected } as Player);
            const result = service['getPlayingPlayerId']();
            expect(result).toEqual(expected);
        });
    });

    describe('isLocalPlayerPlaying', () => {
        it('should return true if is local player', () => {
            const expected = 'expected-id';
            roundManagerSpy.getActivePlayer.and.returnValue({ id: expected } as Player);
            service['playerContainer'] = new PlayerContainer(expected);
            const result = service.isLocalPlayerPlaying();
            expect(result).toBeTrue();
        });

        it('should return false if is not local player', () => {
            const expected = 'expected-id';
            roundManagerSpy.getActivePlayer.and.returnValue({ id: expected } as Player);
            service['playerContainer'] = new PlayerContainer('NOT-expected-id');
            const result = service.isLocalPlayerPlaying();
            expect(result).toBeFalse();
        });

        it('should return false there is no player container', () => {
            service['playerContainer'] = undefined;
            const result = service.isLocalPlayerPlaying();
            expect(result).toBeFalse();
        });
    });

    describe('isLocalPlayerPlayer1', () => {
        it('should return true if is local player', () => {
            const expected = 'expected-id';
            roundManagerSpy.getActivePlayer.and.returnValue({ id: expected } as Player);
            service['playerContainer'] = new PlayerContainer(expected);
            service['playerContainer']['players'].set(1, { id: expected } as Player);

            const result = service['isLocalPlayerPlayer1']();
            expect(result).toBeTrue();
        });

        it('should return false if is not local player', () => {
            const expected = 'expected-id';
            roundManagerSpy.getActivePlayer.and.returnValue({ id: expected } as Player);
            service['playerContainer'] = new PlayerContainer('NOT-expected-id');
            service['playerContainer']['players'].set(1, { id: expected } as Player);
            const result = service['isLocalPlayerPlayer1']();
            expect(result).toBeFalse();
        });

        it('should return false there is no player container', () => {
            service['playerContainer'] = undefined;
            const result = service['isLocalPlayerPlayer1']();
            expect(result).toBeFalse();
        });
    });

    describe('getGameId', () => {
        it('should return gameId', () => {
            const expected = 'expected-id';
            service['gameId'] = expected;
            expect(service.getGameId()).toEqual(expected);
        });
    });

    describe('resetGameId', () => {
        it('should reset gameId', () => {
            const expected = '';
            service['gameId'] = 'something';
            service.resetGameId();
            expect(service['gameId']).toEqual(expected);
        });
    });

    describe('getPlayerByNumber', () => {
        it('should return call playerContainer.getPlayer if it is defined', () => {
            service['playerContainer'] = new PlayerContainer(DEFAULT_PLAYER_1.id);
            const spy = spyOn<any>(service['playerContainer'], 'getPlayer').and.callFake(() => {
                return;
            });
            const playerNumber = 1;
            service.getPlayerByNumber(playerNumber);
            expect(spy).toHaveBeenCalledWith(playerNumber);
        });

        it('should return undefined if player container is undefined', () => {
            service['playerContainer'] = undefined as unknown as PlayerContainer;
            expect(service.getPlayerByNumber(1)).toBeUndefined();
        });
    });

    describe('gameOver', () => {
        const winnerNames = ['The best'];

        it('should change attribute "isGameOver" to true', () => {
            service['handleGameOver'](winnerNames);
            expect(service['isGameOver']).toEqual(true);
        });

        it('should call roundManager.resetTimerData()', () => {
            service['handleGameOver'](winnerNames);
            expect(roundManagerSpy.resetTimerData).toHaveBeenCalled();
        });

        it('should emit endOgGame event', () => {
            service['handleGameOver'](winnerNames);
            expect(gameViewEventManagerSpy.emitGameViewEvent).toHaveBeenCalledWith('endOfGame', winnerNames);
        });
    });

    describe('getLocalPlayer and getLocalPlayerId', () => {
        let player1: Player;
        let player2: Player;

        beforeEach(() => {
            player1 = new Player(DEFAULT_PLAYER_1.id, DEFAULT_PLAYER_1.name, DEFAULT_PLAYER_1.tiles);
            player2 = new Player(DEFAULT_PLAYER_2.id, DEFAULT_PLAYER_2.name, DEFAULT_PLAYER_2.tiles);
        });

        it('should return player 1 if is local', () => {
            service['playerContainer'] = new PlayerContainer(player1.id);
            service['playerContainer']['players'].set(1, player1);
            service['playerContainer']['players'].set(2, player2);

            const result = service.getLocalPlayer();
            expect(result).toEqual(player1);
        });

        it('should return player 2 if is local', () => {
            service['playerContainer'] = new PlayerContainer(player2.id);
            service['playerContainer']['players'].set(1, player1);
            service['playerContainer']['players'].set(2, player2);

            const result = service.getLocalPlayer();
            expect(result).toEqual(player2);
        });

        it('should return undefined if no player', () => {
            service['playerContainer'] = new PlayerContainer(undefined as unknown as string);
            service['playerContainer']['players'].set(1, player1);
            service['playerContainer']['players'].set(2, player2);

            const result = service.getLocalPlayer();
            expect(result).not.toBeDefined();
        });

        it('should return undefined there is no player container', () => {
            service['playerContainer'] = undefined as unknown as PlayerContainer;
            const result = service.getLocalPlayer();
            expect(result).toBeUndefined();
        });

        it('should return player 1 id if is local', () => {
            service['playerContainer'] = new PlayerContainer(player1.id);
            service['playerContainer']['players'].set(1, player1);
            service['playerContainer']['players'].set(2, player2);

            const result = service.getLocalPlayerId();
            expect(result).toEqual(player1.id);
        });

        it('should return player 2 id if is local', () => {
            service['playerContainer'] = new PlayerContainer(player2.id);
            service['playerContainer']['players'].set(1, player1);
            service['playerContainer']['players'].set(2, player2);

            const result = service.getLocalPlayerId();
            expect(result).toEqual(player2.id);
        });

        it('should return undefined if no player', () => {
            service['playerContainer'] = new PlayerContainer(undefined as unknown as string);
            service['playerContainer']['players'].set(1, player1);
            service['playerContainer']['players'].set(2, player2);

            const result = service.getLocalPlayerId();
            expect(result).not.toBeDefined();
        });

        it('should return undefined there is no player container', () => {
            service['playerContainer'] = undefined as unknown as PlayerContainer;
            const result = service.getLocalPlayerId();
            expect(result).toBeUndefined();
        });
    });

    describe('getTotalNumberOfTilesLeft', () => {
        const tilesLeftTestCase: Map<TileReserveData[], number> = new Map([
            [[], 0],
            [[{ letter: 'A', amount: 1 }], 1],
            [
                [
                    { letter: 'A', amount: 1 },
                    { letter: 'B', amount: 1 },
                ],
                2,
            ],
            [
                [
                    { letter: 'A', amount: 1 },
                    { letter: 'B', amount: 1 },
                    { letter: 'C', amount: 1 },
                ],
                3,
            ],
        ]);
        tilesLeftTestCase.forEach((amount: number, tileReserve: TileReserveData[]) => {
            it(`should return ${amount} if there are ${amount} in the tile reserve`, () => {
                service['tileReserve'] = tileReserve;
                expect(service.getTotalNumberOfTilesLeft()).toEqual(amount);
            });
        });

        it('should return 0 if the tile reserve is undefined', () => {
            service['tileReserve'] = undefined as unknown as TileReserveData[];
            expect(service.getTotalNumberOfTilesLeft()).toEqual(0);
        });
    });
});
