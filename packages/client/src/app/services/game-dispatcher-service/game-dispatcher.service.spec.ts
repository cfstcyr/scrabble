/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines */
/* eslint-disable dot-notation */
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { LobbyData, LobbyInfo } from '@app/classes/communication';
import { GameConfigData } from '@app/classes/communication/game-config';
import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
import { TEST_DICTIONARY } from '@app/constants/controller-test-constants';
import { GameMode } from '@app/constants/game-mode';
import { GameType } from '@app/constants/game-type';
import { GameDispatcherController } from '@app/controllers/game-dispatcher-controller/game-dispatcher.controller';
import { GameDispatcherService, SocketService } from '@app/services/';
import { GameViewEventManagerService } from '@app/services/game-view-event-manager-service/game-view-event-manager.service';
import { Observable, Subject, Subscription } from 'rxjs';
import SpyObj = jasmine.SpyObj;

@Component({
    template: '',
})
export class TestComponent {}

const BASE_GAME_ID = 'baseGameId';
const TEST_PLAYER_ID = 'playerId';
const TEST_PLAYER_NAME = 'playerName';

const TEST_LOBBY_DATA: LobbyData = {
    lobbyId: BASE_GAME_ID,
    hostName: '',
    gameType: GameType.Classic,
    gameMode: GameMode.Multiplayer,
    maxRoundTime: 0,
    dictionary: TEST_DICTIONARY,
};
const TEST_LOBBY_INFO: LobbyInfo = {
    ...TEST_LOBBY_DATA,
    canJoin: true,
};
const TEST_LOBBIES = [TEST_LOBBY_INFO];
const TEST_GAME_PARAMETERS = {
    gameType: GameType.LOG2990,
    gameMode: GameMode.Solo,
    virtualPlayerName: 'Victoria',
    level: VirtualPlayerLevel.Beginner,
    timer: '60',
    dictionary: TEST_DICTIONARY,
};
const TEST_FORM_CONTENT = {
    gameType: new FormControl(GameType.Classic, Validators.required),
    gameMode: new FormControl(GameMode.Solo, Validators.required),
    virtualPlayerName: new FormControl('', Validators.required),
    level: new FormControl(VirtualPlayerLevel.Beginner, Validators.required),
    timer: new FormControl('', Validators.required),
    dictionary: new FormControl('', Validators.required),
};
const TEST_FORM: FormGroup = new FormGroup(TEST_FORM_CONTENT);
TEST_FORM.setValue(TEST_GAME_PARAMETERS);

describe('GameDispatcherService', () => {
    let getCurrentLobbyIdSpy: jasmine.Spy;
    let service: GameDispatcherService;
    let gameDispatcherControllerMock: GameDispatcherController;
    let socketServiceMock: SocketService;
    let gameViewEventSpy: SpyObj<GameViewEventManagerService>;

    beforeEach(() => {
        const resetSubject = new Subject();
        gameViewEventSpy = jasmine.createSpyObj('GameViewEventManagerService', ['subscribeToGameViewEvent', 'emitGameViewEvent']);
        gameViewEventSpy.subscribeToGameViewEvent.and.callFake((eventType: string, destroy$: Observable<boolean>, next: any) => {
            if (eventType !== 'resetServices') return new Subscription();
            return resetSubject.subscribe(next);
        });
        gameViewEventSpy.emitGameViewEvent.and.callFake((eventType: string, payload?: any) => {
            if (eventType !== 'resetServices') return;
            resetSubject.next(payload);
        });
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientModule,
                RouterTestingModule.withRoutes([
                    { path: 'waiting-room', component: TestComponent },
                    { path: 'join-waiting-room', component: TestComponent },
                ]),
            ],
            providers: [GameDispatcherController, SocketService, { provide: GameViewEventManagerService, useValue: gameViewEventSpy }],
        });

        gameDispatcherControllerMock = TestBed.inject(GameDispatcherController);

        service = TestBed.inject(GameDispatcherService);

        getCurrentLobbyIdSpy = spyOn(service, 'getCurrentLobbyId').and.returnValue(BASE_GAME_ID);
        socketServiceMock = TestBed.inject(SocketService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('Subscriptions', () => {
        it('should call handleJoinRequest on joinRequestEvent', () => {
            const spy = spyOn<any>(service, 'handleJoinRequest');
            service['gameDispatcherController']['joinRequestEvent'].next(TEST_PLAYER_NAME);
            expect(spy).toHaveBeenCalledWith(TEST_PLAYER_NAME);
        });

        it('should call handleLobbyFull on lobbyFullEvent', () => {
            const spy = spyOn<any>(service, 'handleLobbyFull');
            service['gameDispatcherController']['lobbyFullEvent'].next();
            expect(spy).toHaveBeenCalled();
        });

        it('should call navigateByUrl on lobbyRequestValidEvent', () => {
            const spy = spyOn(service.router, 'navigateByUrl');
            service['gameDispatcherController']['lobbyRequestValidEvent'].next();
            expect(spy).toHaveBeenCalled();
        });

        it('should call handleCanceledGame on canceledGameEvent', () => {
            const spy = spyOn<any>(service, 'handleCanceledGame');
            service['gameDispatcherController']['canceledGameEvent'].next(TEST_PLAYER_NAME);
            expect(spy).toHaveBeenCalledWith(TEST_PLAYER_NAME);
        });

        it('should call handleJoinerRejected on joinerRejectedEvent', () => {
            const spy = spyOn<any>(service, 'handleJoinerRejected');
            service['gameDispatcherController']['joinerRejectedEvent'].next(TEST_PLAYER_NAME);
            expect(spy).toHaveBeenCalledWith(TEST_PLAYER_NAME);
        });

        it('should call handleJoinerRejected on lobbiesUpdateEvent', () => {
            const lobbies: LobbyInfo[] = [];
            const spy = spyOn<any>(service, 'handleLobbiesUpdate');
            service['gameDispatcherController']['lobbiesUpdateEvent'].next(lobbies);
            expect(spy).toHaveBeenCalledWith(lobbies);
        });

        it('should initialize game on initializeGame event received', () => {
            const spy = spyOn(service['gameService'], 'handleInitializeGame').and.callFake(async () => {
                return;
            });
            service['gameDispatcherController']['initializeGame$'].next(undefined);
            expect(spy).toHaveBeenCalledWith(undefined);
        });

        it('on resetServices event, should call resetServiceData', () => {
            const resetDataSpy = spyOn(service, 'resetServiceData').and.callFake(() => {
                return;
            });
            gameViewEventSpy.emitGameViewEvent('resetServices');
            expect(resetDataSpy).toHaveBeenCalled();
        });
    });

    describe('getCurrentLobbyId', () => {
        beforeEach(() => {
            getCurrentLobbyIdSpy.and.callThrough();
        });

        it('should return current lobby id if current lobby is defined', () => {
            service.currentLobby = TEST_LOBBY_INFO;
            expect(service.getCurrentLobbyId()).toEqual(TEST_LOBBY_INFO.lobbyId);
        });

        it('should return empty string if current lobby is undefined', () => {
            service.currentLobby = undefined;
            expect(service.getCurrentLobbyId()).toEqual('');
        });
    });

    describe('ngOnDestroy', () => {
        it('should call next', () => {
            const spy = spyOn<any>(service['serviceDestroyed$'], 'next');
            spyOn<any>(service['serviceDestroyed$'], 'complete');
            service.ngOnDestroy();
            expect(spy).toHaveBeenCalled();
        });

        it('should call complete', () => {
            spyOn(service['serviceDestroyed$'], 'next');
            const spy = spyOn(service['serviceDestroyed$'], 'complete');
            service.ngOnDestroy();
            expect(spy).toHaveBeenCalled();
        });
    });

    it('resetData should set right attributes', () => {
        service.currentLobby = TEST_LOBBY_INFO;
        service.currentName = 'default name';
        getCurrentLobbyIdSpy.and.callThrough();

        service.resetServiceData();
        expect(service.currentLobby).toBeUndefined();
        expect(service.currentName).toEqual('');
        expect(service.getCurrentLobbyId()).toEqual('');
    });

    describe('handleJoinLobby', () => {
        let spyHandleLobbyJoinRequest: jasmine.Spy;

        beforeEach(() => {
            spyHandleLobbyJoinRequest = spyOn(gameDispatcherControllerMock, 'handleLobbyJoinRequest').and.callFake(() => {
                return;
            });
        });
        it('handleJoinLobby should call gameDispatcherController.handleLobbyJoinRequest with the correct parameters', () => {
            service.handleJoinLobby(TEST_LOBBIES[0], TEST_PLAYER_NAME);
            expect(spyHandleLobbyJoinRequest).toHaveBeenCalledWith(TEST_LOBBIES[0].lobbyId, TEST_PLAYER_NAME);
        });

        it('handleJoinLobby should set right attributes', () => {
            service.currentLobby = undefined;
            service.currentName = '';
            getCurrentLobbyIdSpy.and.callThrough();

            service.handleJoinLobby(TEST_LOBBY_INFO, TEST_PLAYER_NAME);
            expect(service.currentLobby).toBeTruthy();
            expect(service.currentName).toEqual(TEST_PLAYER_NAME);
            expect(service.getCurrentLobbyId()).toEqual(TEST_LOBBY_INFO.lobbyId);
        });
    });

    it('handleLobbyListRequest should call gameDispatcherController.handleLobbiesListRequest', () => {
        const spyHandleLobbyJoinRequest = spyOn(gameDispatcherControllerMock, 'handleLobbiesListRequest').and.callFake(() => {
            return;
        });
        service.handleLobbyListRequest();
        expect(spyHandleLobbyJoinRequest).toHaveBeenCalled();
    });

    it('handleCreateGame should call handleGameCreation with the correct parameters for solo game', () => {
        const spyHandleGameCreation = spyOn<any>(service, 'handleGameCreation').and.callFake(() => {
            return;
        });
        spyOn(gameDispatcherControllerMock.socketService, 'getId').and.callFake(() => {
            return TEST_PLAYER_ID;
        });
        const EXPECTED_GAME_CONFIG: GameConfigData = {
            playerName: TEST_PLAYER_NAME,
            playerId: TEST_PLAYER_ID,
            gameType: TEST_GAME_PARAMETERS.gameType,
            gameMode: TEST_GAME_PARAMETERS.gameMode,
            virtualPlayerName: TEST_GAME_PARAMETERS.virtualPlayerName,
            virtualPlayerLevel: TEST_GAME_PARAMETERS.level,
            maxRoundTime: TEST_GAME_PARAMETERS.timer as unknown as number,
            dictionary: TEST_DICTIONARY,
        };

        service.handleCreateGame(TEST_PLAYER_NAME, TEST_FORM);
        expect(spyHandleGameCreation).toHaveBeenCalledWith(EXPECTED_GAME_CONFIG);
    });

    it('handleCreateGame should call handleGameCreation with the correct parameters for multiplayer game', () => {
        const spyHandleGameCreation = spyOn<any>(service, 'handleGameCreation').and.callFake(() => {
            return;
        });
        spyOn(gameDispatcherControllerMock.socketService, 'getId').and.callFake(() => {
            return TEST_PLAYER_ID;
        });
        const EXPECTED_GAME_CONFIG: GameConfigData = {
            playerName: TEST_PLAYER_NAME,
            playerId: TEST_PLAYER_ID,
            gameType: TEST_GAME_PARAMETERS.gameType,
            gameMode: GameMode.Multiplayer,
            maxRoundTime: TEST_GAME_PARAMETERS.timer as unknown as number,
            dictionary: TEST_DICTIONARY,
        };

        TEST_FORM.controls.gameMode.patchValue(GameMode.Multiplayer);
        service.handleCreateGame(TEST_PLAYER_NAME, TEST_FORM);
        expect(spyHandleGameCreation).toHaveBeenCalledWith(EXPECTED_GAME_CONFIG);
        TEST_FORM.setValue(TEST_GAME_PARAMETERS);
    });

    describe('handleCancelGame', () => {
        let cancelGameSpy: jasmine.Spy;
        let resetDataSpy: jasmine.Spy;

        beforeEach(() => {
            resetDataSpy = spyOn<any>(service, 'resetServiceData');
            cancelGameSpy = spyOn(service['gameDispatcherController'], 'handleCancelGame');
        });

        afterEach(() => {
            cancelGameSpy.calls.reset();
            resetDataSpy.calls.reset();
        });

        it('should call handleCancelGame if gameId is defined', () => {
            getCurrentLobbyIdSpy.and.returnValue(BASE_GAME_ID);
            service.handleCancelGame();
            expect(cancelGameSpy).toHaveBeenCalledWith(BASE_GAME_ID);
        });

        it('should not call handleCancelGame if gameId is undefined', () => {
            getCurrentLobbyIdSpy.and.returnValue('');
            service.handleCancelGame();
            expect(cancelGameSpy).not.toHaveBeenCalled();
        });

        it('should call resetData', () => {
            service.handleCancelGame();
            expect(resetDataSpy).toHaveBeenCalled();
        });

        it('should call not call resetData if mustResetData = false', () => {
            service.handleCancelGame(false);
            expect(resetDataSpy).not.toHaveBeenCalled();
        });
    });

    describe('handleRecreateGame', () => {
        let createSpy: jasmine.Spy;

        beforeEach(() => {
            createSpy = spyOn<any>(service, 'handleGameCreation').and.callFake(() => {
                return;
            });
            spyOn(socketServiceMock, 'getId').and.returnValue('socketid');
        });

        afterEach(() => {
            createSpy.calls.reset();
        });

        const gameParametersForm: FormGroup = new FormGroup({
            level: new FormControl(VirtualPlayerLevel.Beginner, Validators.required),
            virtualPlayerName: new FormControl('', Validators.required),
            gameMode: new FormControl(GameMode.Solo, Validators.required),
        });
        const formValues = {
            virtualPlayerName: 'JVname',
            level: VirtualPlayerLevel.Beginner,
            gameMode: GameMode.Solo,
        };
        gameParametersForm.setValue(formValues);

        it('should call handleGameCreation if the lobby is defined and create a SoloGame', () => {
            service.currentLobby = TEST_LOBBY_INFO;
            service.handleRecreateGame(gameParametersForm);
            expect(createSpy).toHaveBeenCalled();
        });

        it('should call handleGameCreation if the lobby is defined  and create a MultiplayerGame', () => {
            service.currentLobby = TEST_LOBBY_INFO;
            service.handleRecreateGame();
            expect(createSpy).toHaveBeenCalled();
        });

        it('should not call handleCancelGame if gameId is undefined', () => {
            service.currentLobby = undefined;
            service.handleRecreateGame();
            expect(createSpy).not.toHaveBeenCalled();
        });
    });

    describe('handleGameCreation', () => {
        let handleCreationSpy: jasmine.Spy;
        let postObservable: Subject<{ lobbyData: LobbyData }>;
        let routerSpy: jasmine.Spy;
        let gameConfigData: GameConfigData;
        let gameCreationFailedSpy: jasmine.Spy;

        beforeEach(() => {
            postObservable = new Subject();
            handleCreationSpy = spyOn(gameDispatcherControllerMock, 'handleGameCreation').and.returnValue(postObservable.asObservable());
            gameCreationFailedSpy = spyOn(service['gameCreationFailed$'], 'next').and.callFake(() => {
                return;
            });
            routerSpy = spyOn(service['router'], 'navigateByUrl');
            gameConfigData = TEST_GAME_PARAMETERS as unknown as GameConfigData;
            service['handleGameCreation'](gameConfigData);
        });

        it('should call gameDispatcherController.handleGameCreation', () => {
            expect(handleCreationSpy).toHaveBeenCalledWith(gameConfigData);
        });

        it('should set currentLobby to response lobbyData', () => {
            postObservable.next({ lobbyData: TEST_LOBBY_DATA });
            expect(service.currentLobby).toEqual(TEST_LOBBY_DATA);
        });

        it('if is Multiplayer, should route to waiting-room', () => {
            TEST_LOBBY_DATA.gameMode = GameMode.Multiplayer;
            postObservable.next({ lobbyData: TEST_LOBBY_DATA });
            expect(routerSpy).toHaveBeenCalledWith('waiting-room');
        });

        it('if is Solo, should NOT route to waiting-room', () => {
            TEST_LOBBY_DATA.gameMode = GameMode.Solo;
            postObservable.next({ lobbyData: TEST_LOBBY_DATA });
            expect(routerSpy).not.toHaveBeenCalledWith('waiting-room');
            TEST_LOBBY_DATA.gameMode = GameMode.Multiplayer;
        });

        it('on error, should send gameCreationFailed$ event', () => {
            postObservable.error({});
            expect(gameCreationFailedSpy).toHaveBeenCalled();
        });
    });

    describe('handleConfirmation', () => {
        let confirmationObservable: Subject<void>;
        let confirmationSpy: jasmine.Spy;
        let gameCreationFailedSpy: jasmine.Spy;

        beforeEach(() => {
            confirmationObservable = new Subject<void>();
            confirmationSpy = spyOn(service['gameDispatcherController'], 'handleConfirmationGameCreation').and.returnValue(
                confirmationObservable.asObservable(),
            );
            gameCreationFailedSpy = spyOn(service['gameCreationFailed$'], 'next').and.callFake(() => {
                return;
            });
        });

        afterEach(() => {
            confirmationSpy.calls.reset();
        });

        it('should call handleConfirmation if gameId is defined', () => {
            getCurrentLobbyIdSpy.and.returnValue(BASE_GAME_ID);
            service.handleConfirmation(TEST_PLAYER_NAME);
            expect(confirmationSpy).toHaveBeenCalledWith(TEST_PLAYER_NAME, BASE_GAME_ID);
        });

        it('should not call handleCancelGame if gameId is undefined', () => {
            getCurrentLobbyIdSpy.and.returnValue('');
            service.handleConfirmation(TEST_PLAYER_NAME);
            expect(confirmationSpy).not.toHaveBeenCalled();
        });

        it('on error, should emit gameCreationFailed', () => {
            getCurrentLobbyIdSpy.and.returnValue(BASE_GAME_ID);
            service.handleConfirmation(TEST_PLAYER_NAME);
            confirmationObservable.error({});
            expect(gameCreationFailedSpy).toHaveBeenCalled();
        });
    });

    describe('handleRejection', () => {
        let rejectionSpy: jasmine.Spy;

        beforeEach(() => {
            rejectionSpy = spyOn(service['gameDispatcherController'], 'handleRejectionGameCreation');
        });

        afterEach(() => {
            rejectionSpy.calls.reset();
        });

        it('should call handleCancelGame if gameId is defined', () => {
            getCurrentLobbyIdSpy.and.returnValue(BASE_GAME_ID);
            service.handleRejection(TEST_PLAYER_NAME);
            expect(rejectionSpy).toHaveBeenCalledWith(TEST_PLAYER_NAME, BASE_GAME_ID);
        });

        it('should not call handleCancelGame if currentLobbyId is undefined', () => {
            getCurrentLobbyIdSpy.and.returnValue('');
            service.handleRejection(TEST_PLAYER_NAME);
            expect(rejectionSpy).not.toHaveBeenCalled();
        });
    });

    describe('handleJoinRequest', () => {
        it('should emit to joinRequestEvent', () => {
            const spy = spyOn(service['joinRequestEvent'], 'next');
            service['handleJoinRequest'](TEST_PLAYER_NAME);
            expect(spy).toHaveBeenCalledWith(TEST_PLAYER_NAME);
        });
    });

    describe('handleJoinerRejected', () => {
        let emitSpy: jasmine.Spy;
        let resetSpy: jasmine.Spy;

        beforeEach(() => {
            resetSpy = spyOn<any>(service, 'resetServiceData');
            emitSpy = spyOn(service['joinerRejectedEvent'], 'next');
        });

        afterEach(() => {
            emitSpy.calls.reset();
            resetSpy.calls.reset();
        });

        it('should emit to joinerRejectedEvent', () => {
            service['handleJoinerRejected'](TEST_PLAYER_NAME);
            expect(emitSpy).toHaveBeenCalledWith(TEST_PLAYER_NAME);
        });

        it('should call resetData', () => {
            service['handleJoinerRejected'](TEST_PLAYER_NAME);
            expect(resetSpy).toHaveBeenCalledWith();
        });
    });

    describe('handleLobbiesUpdate', () => {
        it('should emit to joinRequestEvent', () => {
            const args: LobbyInfo[] = [];
            const spy = spyOn(service['lobbiesUpdateEvent'], 'next');
            service['handleLobbiesUpdate'](args);
            expect(spy).toHaveBeenCalledWith(args);
        });
    });

    describe('handleLobbyFull', () => {
        let emitSpy: jasmine.Spy;
        let resetSpy: jasmine.Spy;

        beforeEach(() => {
            resetSpy = spyOn<any>(service, 'resetServiceData');
            emitSpy = spyOn(service['lobbyFullEvent'], 'next');
        });

        afterEach(() => {
            emitSpy.calls.reset();
            resetSpy.calls.reset();
        });

        it('should emit to lobbyFullEvent', () => {
            service['handleLobbyFull']();
            expect(emitSpy).toHaveBeenCalledWith();
        });

        it('should call resetData', () => {
            service['handleLobbyFull']();
            expect(resetSpy).toHaveBeenCalledWith();
        });
    });

    describe('handleCanceledGame', () => {
        let emitSpy: jasmine.Spy;
        let resetSpy: jasmine.Spy;

        beforeEach(() => {
            resetSpy = spyOn<any>(service, 'resetServiceData');
            emitSpy = spyOn(service['canceledGameEvent'], 'next');
        });

        afterEach(() => {
            emitSpy.calls.reset();
            resetSpy.calls.reset();
        });

        it('should emit to canceledGameEvent', () => {
            service['handleCanceledGame'](TEST_PLAYER_NAME);
            expect(emitSpy).toHaveBeenCalledWith(TEST_PLAYER_NAME);
        });

        it('should call resetData', () => {
            service['handleCanceledGame'](TEST_PLAYER_NAME);
            expect(resetSpy).toHaveBeenCalledWith();
        });
    });

    describe('isGameModeSolo', () => {
        it('should return true ', () => {
            expect(service['isGameModeSolo'](TEST_FORM)).toBeTrue();
        });

        it('should return false if undefined', () => {
            expect(service['isGameModeSolo']()).toBeFalse();
        });

        it('should return false if multiplayer', () => {
            TEST_FORM.patchValue({ gameMode: GameMode.Multiplayer });
            expect(service['isGameModeSolo'](TEST_FORM)).toBeFalse();
            TEST_FORM.patchValue({ gameMode: GameMode.Solo });
        });
    });

    it('observeGameCreationFailed should return observable of gameCreationFailed$', () => {
        expect(service.observeGameCreationFailed()).toEqual(service['gameCreationFailed$'].asObservable());
    });

    describe('subcription methods', () => {
        let serviceDestroyed$: Subject<boolean>;
        let callback: () => void;

        beforeEach(() => {
            serviceDestroyed$ = new Subject();
            callback = () => {
                return;
            };
        });

        it('subscribeToJoinRequestEvent should call subscribe method on joinRequestEvent', () => {
            const subscriptionSpy = spyOn(service['joinRequestEvent'], 'subscribe');
            service.subscribeToJoinRequestEvent(serviceDestroyed$, callback);
            expect(subscriptionSpy).toHaveBeenCalled();
        });

        it('subscribeToCanceledGameEvent should call subscribe method on joinRequestEvent', () => {
            const subscriptionSpy = spyOn(service['canceledGameEvent'], 'subscribe');
            service.subscribeToCanceledGameEvent(serviceDestroyed$, callback);
            expect(subscriptionSpy).toHaveBeenCalled();
        });

        it('subscribeToLobbyFullEvent should call subscribe method on joinRequestEvent', () => {
            const subscriptionSpy = spyOn(service['lobbyFullEvent'], 'subscribe');
            service.subscribeToLobbyFullEvent(serviceDestroyed$, callback);
            expect(subscriptionSpy).toHaveBeenCalled();
        });

        it('subscribeToLobbiesUpdateEvent should call subscribe method on joinRequestEvent', () => {
            const subscriptionSpy = spyOn(service['lobbiesUpdateEvent'], 'subscribe');
            service.subscribeToLobbiesUpdateEvent(serviceDestroyed$, callback);
            expect(subscriptionSpy).toHaveBeenCalled();
        });

        it('subscribeToJoinerRejectedEvent should call subscribe method on joinRequestEvent', () => {
            const subscriptionSpy = spyOn(service['joinerRejectedEvent'], 'subscribe');
            service.subscribeToJoinerRejectedEvent(serviceDestroyed$, callback);
            expect(subscriptionSpy).toHaveBeenCalled();
        });
    });
});
