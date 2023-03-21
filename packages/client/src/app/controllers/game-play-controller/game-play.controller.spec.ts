/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActionData, ActionType } from '@app/classes/actions/action-data';
import { GameUpdateData } from '@app/classes/communication';
import { Message } from '@app/classes/communication/message';
import { SocketTestHelper } from '@app/classes/socket-test-helper/socket-test-helper.spec';
import { Square } from '@app/classes/square';
import { HTTP_ABORT_ERROR } from '@app/constants/controllers-errors';
import { SYSTEM_ID } from '@app/constants/game-constants';
import SocketService from '@app/services/socket-service/socket.service';
import { Observable, of, Subscription } from 'rxjs';
import { Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { GamePlayController } from './game-play.controller';

const DEFAULT_GAME_ID = 'grogarsID';

describe('GamePlayController', () => {
    let controller: GamePlayController;
    let httpMock: HttpTestingController;
    let socketServiceMock: SocketService;
    let socketHelper: SocketTestHelper;

    beforeEach(async () => {
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketService(jasmine.createSpyObj('AlertService', ['alert', 'error', 'warn', 'success', 'info']));
        socketServiceMock['socket'] = socketHelper as unknown as Socket;
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule],
            providers: [{ provide: SocketService, useValue: socketServiceMock }],
        });
        controller = TestBed.inject(GamePlayController);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should create', () => {
        expect(controller).toBeTruthy();
    });

    describe('Configure Socket', () => {
        it('On gameUpdate, should push new gameUpdate', () => {
            const spy = spyOn(controller['gameUpdate$'], 'next').and.callFake(() => {
                return;
            });
            const gameUpdateData: GameUpdateData = {
                isGameOver: true,
            };
            socketHelper.peerSideEmit('gameUpdate', gameUpdateData);
            expect(spy).toHaveBeenCalled();
        });

        it('On newMessage, should push new message', () => {
            const spy = spyOn(controller['newMessage$'], 'next').and.callFake(() => {
                return;
            });
            const newMessage: Message = {
                content: 'Allo',
                senderId: SYSTEM_ID,
                gameId: DEFAULT_GAME_ID,
            };
            socketHelper.peerSideEmit('newMessage', newMessage);
            expect(spy).toHaveBeenCalled();
        });

        it('On firstSquareSelected, should push new square', () => {
            const spy = spyOn(controller['firstSquareSelected$'], 'next').and.callFake(() => {
                return;
            });
            const square: Square = {
                tile: null,
                position: { row: 0, column: 0 },
                scoreMultiplier: null,
                wasMultiplierUsed: false,
                isCenter: false,
            };
            socketHelper.peerSideEmit('firstSquareSelected', square);
            expect(spy).toHaveBeenCalled();
        });

        it('On firstSquareCancelled, should push null', () => {
            const spy = spyOn(controller['firstSquareSelected$'], 'next').and.callFake(() => {
                return;
            });
            socketHelper.peerSideEmit('firstSquareCancelled');
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('HTTP', () => {
        it('sendAction should post action to endpoint', () => {
            const typedInput = '';
            const httpPostSpy = spyOn(controller['http'], 'post').and.returnValue(of(true) as any);
            const actionData: ActionData = {
                type: ActionType.PASS,
                input: typedInput,
                payload: {},
            };
            const endpoint = `${environment.serverUrl}/games/${DEFAULT_GAME_ID}/players/action`;

            controller.sendAction(DEFAULT_GAME_ID, actionData);
            expect(httpPostSpy).toHaveBeenCalledWith(endpoint, { type: actionData.type, payload: actionData.payload, input: typedInput });
        });

        it('sendAction should post message to endpoint', () => {
            const httpPostSpy = spyOn(controller['http'], 'post').and.returnValue(of(true) as any);
            const newMessage: Message = {
                content: 'Allo',
                senderId: SYSTEM_ID,
                gameId: DEFAULT_GAME_ID,
            };
            const endpoint = `${environment.serverUrl}/games/${DEFAULT_GAME_ID}/players/message`;

            controller.sendMessage(DEFAULT_GAME_ID, newMessage);
            expect(httpPostSpy).toHaveBeenCalledWith(endpoint, newMessage);
        });

        it('sendError should post error to endpoint', () => {
            const httpPostSpy = spyOn(controller['http'], 'post').and.returnValue(of(true) as any);
            const newMessage: Message = {
                content: 'error',
                senderId: SYSTEM_ID,
                gameId: DEFAULT_GAME_ID,
            };
            const endpoint = `${environment.serverUrl}/games/${DEFAULT_GAME_ID}/players/error`;

            controller.sendError(DEFAULT_GAME_ID, newMessage);
            expect(httpPostSpy).toHaveBeenCalledWith(endpoint, newMessage);
        });

        it('handleFirstSquareSelected should post square to endpoint', () => {
            const httpPostSpy = spyOn(controller['http'], 'post').and.returnValue(of(true) as any);
            const endpoint = `${environment.serverUrl}/games/${DEFAULT_GAME_ID}/squares/select`;
            const square: Square = {
                tile: null,
                position: { row: 0, column: 0 },
                scoreMultiplier: null,
                wasMultiplierUsed: false,
                isCenter: false,
            };

            controller.handleFirstSquareSelected(DEFAULT_GAME_ID, square);
            expect(httpPostSpy).toHaveBeenCalledWith(endpoint, square);
        });

        it('handleFirstSquareCancelled should delete to endpoint', () => {
            const httpDeleteSpy = spyOn(controller['http'], 'delete').and.returnValue(of(true) as any);
            const endpoint = `${environment.serverUrl}/games/${DEFAULT_GAME_ID}/squares/cancel`;

            controller.handleFirstSquareCancelled(DEFAULT_GAME_ID);
            expect(httpDeleteSpy).toHaveBeenCalledWith(endpoint);
        });
    });

    it('HandleReconnection should post newPlayerId to reconnect endpoint', () => {
        const httpPostSpy = spyOn(controller['http'], 'post').and.returnValue(of(true) as any);
        const newPlayerId = 'NEW_ID';
        const endpoint = `${environment.serverUrl}/games/${DEFAULT_GAME_ID}/players/reconnect`;

        controller.handleReconnection(DEFAULT_GAME_ID, newPlayerId);
        expect(httpPostSpy).toHaveBeenCalledWith(endpoint, { newPlayerId });
    });

    it('HandleDisconnect should send DELETE to disconnect endpoint', () => {
        const observable = new Observable();
        const httpDeleteSpy = spyOn(controller['http'], 'delete').and.returnValue(observable);
        spyOn(observable, 'subscribe').and.callFake(() => {
            return new Subscription();
        });

        controller.handleDisconnection(DEFAULT_GAME_ID);
        expect(httpDeleteSpy).toHaveBeenCalled();
    });

    it('HandleDisconnect should handle error if necessary', () => {
        const observable = new Observable();
        spyOn(controller['http'], 'delete').and.returnValue(observable);
        const observableSpy = spyOn(observable, 'subscribe').and.callFake(() => {
            return new Subscription();
        });

        controller.handleDisconnection(DEFAULT_GAME_ID);
        expect(observableSpy).toHaveBeenCalledWith(controller['handleDisconnectResponse'], controller['handleDisconnectError']);
    });

    it('handleDisconnectResponse should exist', () => {
        expect(controller['handleDisconnectResponse']()).toBeUndefined();
    });

    it('handleDisconnectError should throw error if status is NOT HTTP_ABORT_ERROR', () => {
        const error: { message: string; status: number } = {
            message: 'ABORT',
            status: 1,
        };
        expect(() => controller['handleDisconnectError'](error)).toThrowError(error.message);
    });

    it('handleDisconnectError should NOT throw error if status is HTTP_ABORT_ERROR', () => {
        const error: { message: string; status: number } = {
            message: 'ABORT',
            status: HTTP_ABORT_ERROR,
        };
        expect(() => controller['handleDisconnectError'](error)).not.toThrowError(error.message);
    });

    it('observeGameUpdate should return gameUpdate$ as observable', () => {
        const result: Observable<GameUpdateData> = controller.observeGameUpdate();
        expect(result).toEqual(controller['gameUpdate$'].asObservable());
    });

    it('obvserveNewMessage should return newMessage$ as observable', () => {
        const result: Observable<Message | null> = controller.observeNewMessage();
        expect(result).toEqual(controller['newMessage$'].asObservable());
    });

    it('observeActionDone should return actionDone$ as observable', () => {
        const result: Observable<void> = controller.observeActionDone();
        expect(result).toEqual(controller['actionDone$'].asObservable());
    });

    it('observeFirstSquareSelected should return firstSquareSelected$ as observable', () => {
        const result: Observable<Square | null> = controller.observeFirstSquareSelected();
        expect(result).toEqual(controller['firstSquareSelected$'].asObservable());
    });
});
