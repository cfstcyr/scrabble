/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { HttpStatusCode } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { GameConfigData, StartGameData } from '@app/classes/communication/game-config';
import PlayerName from '@app/classes/communication/player-name';
import { SocketTestHelper } from '@app/classes/socket-test-helper/socket-test-helper.spec';
import { TEST_DICTIONARY } from '@app/constants/controller-test-constants';
import { GameMode } from '@app/constants/game-mode';
import { GameType } from '@app/constants/game-type';
import { GameDispatcherController } from '@app/controllers/game-dispatcher-controller/game-dispatcher.controller';
import { GameService } from '@app/services';
import SocketService from '@app/services/socket-service/socket.service';
import { Observable, of, Subject, throwError } from 'rxjs';
import { Socket } from 'socket.io-client';

const DEFAULT_SOCKET_ID = 'testSocketID';
const DEFAULT_PLAYER_NAME = 'grogars';
const DEFAULT_GAME_ID = 'grogarsID';
const DEFAULT_OPPONENT_NAME: PlayerName[] = [{ name: DEFAULT_PLAYER_NAME }];
const DEFAULT_GAME_DATA: GameConfigData = {
    playerName: DEFAULT_PLAYER_NAME,
    playerId: 'tessId',
    gameType: GameType.Classic,
    gameMode: GameMode.Multiplayer,
    maxRoundTime: 0,
    dictionary: TEST_DICTIONARY,
};

describe('GameDispatcherController', () => {
    let controller: GameDispatcherController;
    let httpMock: HttpTestingController;
    let socketServiceMock: SocketService;
    let socketHelper: SocketTestHelper;

    beforeEach(async () => {
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketService();
        socketServiceMock['socket'] = socketHelper as unknown as Socket;
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule],
            providers: [GameDispatcherController, { provide: SocketService, useValue: socketServiceMock }, GameService],
        });
        controller = TestBed.inject(GameDispatcherController);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should create', () => {
        expect(controller).toBeTruthy();
    });

    describe('ngOnDestroy', () => {
        it('should call next', () => {
            const spy = spyOn(controller['serviceDestroyed$'], 'next');
            spyOn(controller['serviceDestroyed$'], 'complete');
            controller.ngOnDestroy();
            expect(spy).toHaveBeenCalled();
        });

        it('should call complete', () => {
            spyOn(controller['serviceDestroyed$'], 'next');
            const spy = spyOn(controller['serviceDestroyed$'], 'complete');
            controller.ngOnDestroy();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('configureSocket', () => {
        it('On join request, configureSocket should emit opponent name', () => {
            const joinRequestSpy = spyOn(controller['joinRequestEvent'], 'next').and.callThrough();
            socketHelper.peerSideEmit('joinRequest', DEFAULT_OPPONENT_NAME);
            expect(joinRequestSpy).toHaveBeenCalled();
        });

        it('On start game, configureSocket should emit socket id and game data', async () => {
            spyOn(socketServiceMock, 'getId').and.returnValue('id');
            const initializeEventSpy = spyOn(controller['initializeGame$'], 'next').and.callFake(() => {
                return;
            });
            socketHelper.peerSideEmit('startGame', DEFAULT_GAME_DATA);
            expect(initializeEventSpy).toHaveBeenCalledWith({
                localPlayerId: 'id',
                startGameData: DEFAULT_GAME_DATA as unknown as StartGameData,
            });
        });

        it('On lobbies update, configureSocket should emit hostName', () => {
            const lobbiesUpdateSpy = spyOn(controller['lobbiesUpdateEvent'], 'next').and.callThrough();
            socketHelper.peerSideEmit('lobbiesUpdate', DEFAULT_OPPONENT_NAME);
            expect(lobbiesUpdateSpy).toHaveBeenCalled();
        });

        it('On rejected, configureSocket should emit lobbies', () => {
            const rejectedSpy = spyOn(controller['joinerRejectedEvent'], 'next').and.callThrough();
            socketHelper.peerSideEmit('rejected', DEFAULT_OPPONENT_NAME);
            expect(rejectedSpy).toHaveBeenCalled();
        });

        it('On cancel game, configureSocket should emit opponent name', () => {
            const cancelGameSpy = spyOn(controller['canceledGameEvent'], 'next').and.callThrough();
            socketHelper.peerSideEmit('canceledGame', DEFAULT_OPPONENT_NAME);
            expect(cancelGameSpy).toHaveBeenCalled();
        });
    });

    describe('handleGameCreation', () => {
        it('should  make an HTTP post request', () => {
            const httpPostSpy = spyOn(controller['http'], 'post').and.returnValue(of(true) as any);
            controller.handleGameCreation(DEFAULT_GAME_DATA);
            expect(httpPostSpy).toHaveBeenCalled();
        });
    });

    describe('handleConfirmationGameCreation', () => {
        it('handleConfirmationGameCreation should make an HTTP post request', () => {
            const httpPostSpy = spyOn(controller['http'], 'post').and.returnValue(of(true) as any);
            controller.handleConfirmationGameCreation(DEFAULT_PLAYER_NAME, DEFAULT_GAME_ID);
            expect(httpPostSpy).toHaveBeenCalled();
        });
    });

    describe('handleRejectionGameCreation', () => {
        it('handleRejectionGameCreation should make an HTTP post request', () => {
            const httpPostSpy = spyOn(controller['http'], 'post').and.returnValue(of(true) as any);
            controller.handleRejectionGameCreation(DEFAULT_PLAYER_NAME, DEFAULT_GAME_ID);
            expect(httpPostSpy).toHaveBeenCalled();
        });

        it('handleRejectionGameCreation should subscribe after making an HTTP post request', () => {
            spyOn(controller['socketService'], 'getId').and.returnValue(DEFAULT_SOCKET_ID);

            const observable = new Observable();
            spyOn(controller['http'], 'post').and.returnValue(observable);
            const spy = spyOn(observable, 'subscribe');

            controller.handleRejectionGameCreation({} as unknown as string, {} as unknown as string);

            expect(spy).toHaveBeenCalled();
        });
    });

    describe('handleCancelGame', () => {
        it('handleCancelGame should make an HTTP delete request', () => {
            const httpPostSpy = spyOn(controller['http'], 'delete').and.returnValue(of(true) as any);
            controller.handleCancelGame(DEFAULT_GAME_ID);
            expect(httpPostSpy).toHaveBeenCalled();
        });

        it('handleCancelGame should subscribe after making an HTTP delete request', () => {
            spyOn(controller['socketService'], 'getId').and.returnValue(DEFAULT_SOCKET_ID);

            const observable = new Observable();
            spyOn(controller['http'], 'delete').and.returnValue(observable);
            const spy = spyOn(observable, 'subscribe');

            controller.handleCancelGame({} as unknown as string);

            expect(spy).toHaveBeenCalled();
        });
    });

    describe('handleLobbiesListRequest', () => {
        it('handleLobbiesListRequest should make an HTTP get request ', () => {
            const httpPostSpy = spyOn(controller['http'], 'get').and.returnValue(of(true) as any);
            controller.handleLobbiesListRequest();
            expect(httpPostSpy).toHaveBeenCalled();
        });

        it('handleLobbiesListRequest should subscribe after making an HTTP get request', () => {
            spyOn(controller['socketService'], 'getId').and.returnValue(DEFAULT_SOCKET_ID);

            const observable = new Observable();
            spyOn(controller['http'], 'get').and.returnValue(observable);
            const spy = spyOn(observable, 'subscribe');

            controller.handleLobbiesListRequest();

            expect(spy).toHaveBeenCalled();
        });
    });

    describe('handleLobbyJoinRequest', () => {
        it('handleLobbyJoinRequest should make an HTTP post request', () => {
            const httpPostSpy = spyOn(controller['http'], 'post').and.returnValue(of(true) as any);
            controller.handleLobbyJoinRequest(DEFAULT_GAME_ID, DEFAULT_PLAYER_NAME);
            expect(httpPostSpy).toHaveBeenCalled();
        });

        it('handleLobbyJoinRequest should subscribe after making an HTTP post request', () => {
            spyOn(controller['socketService'], 'getId').and.returnValue(DEFAULT_SOCKET_ID);

            const observable = new Observable();
            spyOn(controller['http'], 'post').and.returnValue(observable);
            const spy = spyOn(observable, 'subscribe');

            controller.handleLobbyJoinRequest({} as unknown as string, {} as unknown as string);
            expect(spy).toHaveBeenCalled();
        });

        it('handleLobbyJoinRequest should emit when HTTP post request on success', () => {
            const fakeObservable = of<string>('fakeResponse');
            spyOn(controller['http'], 'post').and.returnValue(fakeObservable);
            const successSpy = spyOn(controller['lobbyRequestValidEvent'], 'next');
            controller.handleLobbyJoinRequest(DEFAULT_GAME_ID, DEFAULT_PLAYER_NAME);
            expect(successSpy).toHaveBeenCalled();
        });

        it('handleLobbyJoinRequest should call handleJoinError when HTTP post request generates an error', () => {
            spyOn(controller['http'], 'post').and.callFake(() => {
                return throwError('fakeError');
            });
            const errorSpy = spyOn<any>(controller, 'handleJoinError').and.callFake(() => {
                return;
            });
            controller.handleLobbyJoinRequest(DEFAULT_GAME_ID, DEFAULT_PLAYER_NAME);
            expect(errorSpy).toHaveBeenCalled();
        });
    });

    describe('handleJoinError', () => {
        it('handleJoinError should emit lobyFullEvent if error status is Unauthorized', () => {
            const lobbyFullNextSpy = spyOn(controller['lobbyFullEvent'], 'next').and.callFake(() => {
                return;
            });
            const canceledGameNextSpy = spyOn(controller['canceledGameEvent'], 'next').and.callFake(() => {
                return;
            });
            controller['handleJoinError'](HttpStatusCode.Unauthorized);
            expect(lobbyFullNextSpy).toHaveBeenCalled();
            expect(canceledGameNextSpy).not.toHaveBeenCalled();
        });

        it('handleJoinError should emit canceledGameEvent if error status is Gone', () => {
            const lobbyFullNextSpy = spyOn(controller['lobbyFullEvent'], 'next').and.callFake(() => {
                return;
            });
            const canceledGameNextSpy = spyOn(controller['canceledGameEvent'], 'next').and.callFake(() => {
                return;
            });
            controller['handleJoinError'](HttpStatusCode.Gone);
            expect(lobbyFullNextSpy).not.toHaveBeenCalled();
            expect(canceledGameNextSpy).toHaveBeenCalled();
        });

        it('handleJoinError should emit nothing if error status is not Unauthorized or Gone', () => {
            const lobbyFullNextSpy = spyOn(controller['lobbyFullEvent'], 'next').and.callFake(() => {
                return;
            });
            const canceledGameNextSpy = spyOn(controller['canceledGameEvent'], 'next').and.callFake(() => {
                return;
            });
            controller['handleJoinError'](HttpStatusCode.BadGateway);
            expect(lobbyFullNextSpy).not.toHaveBeenCalled();
            expect(canceledGameNextSpy).not.toHaveBeenCalled();
        });
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
            const subscriptionSpy = spyOn(controller['joinRequestEvent'], 'subscribe');
            controller.subscribeToJoinRequestEvent(serviceDestroyed$, callback);
            expect(subscriptionSpy).toHaveBeenCalled();
        });

        it('subscribeToCanceledGameEvent should call subscribe method on joinRequestEvent', () => {
            const subscriptionSpy = spyOn(controller['canceledGameEvent'], 'subscribe');
            controller.subscribeToCanceledGameEvent(serviceDestroyed$, callback);
            expect(subscriptionSpy).toHaveBeenCalled();
        });

        it('subscribeToLobbyFullEvent should call subscribe method on joinRequestEvent', () => {
            const subscriptionSpy = spyOn(controller['lobbyFullEvent'], 'subscribe');
            controller.subscribeToLobbyFullEvent(serviceDestroyed$, callback);
            expect(subscriptionSpy).toHaveBeenCalled();
        });

        it('subscribeToLobbyRequestValidEvent should call subscribe method on joinRequestEvent', () => {
            const subscriptionSpy = spyOn(controller['lobbyRequestValidEvent'], 'subscribe');
            controller.subscribeToLobbyRequestValidEvent(serviceDestroyed$, callback);
            expect(subscriptionSpy).toHaveBeenCalled();
        });

        it('subscribeToLobbiesUpdateEvent should call subscribe method on joinRequestEvent', () => {
            const subscriptionSpy = spyOn(controller['lobbiesUpdateEvent'], 'subscribe');
            controller.subscribeToLobbiesUpdateEvent(serviceDestroyed$, callback);
            expect(subscriptionSpy).toHaveBeenCalled();
        });

        it('subscribeToJoinerRejectedEvent should call subscribe method on joinRequestEvent', () => {
            const subscriptionSpy = spyOn(controller['joinerRejectedEvent'], 'subscribe');
            controller.subscribeToJoinerRejectedEvent(serviceDestroyed$, callback);
            expect(subscriptionSpy).toHaveBeenCalled();
        });

        it('subscribeToInitializeGame should call subscribe method on initializeGame$', () => {
            const subscriptionSpy = spyOn(controller['initializeGame$'], 'subscribe');
            controller.subscribeToInitializeGame(serviceDestroyed$, callback);
            expect(subscriptionSpy).toHaveBeenCalled();
        });
    });
});
