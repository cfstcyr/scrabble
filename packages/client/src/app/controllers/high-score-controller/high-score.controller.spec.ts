/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HighScore } from '@app/classes/admin';
import { SocketTestHelper } from '@app/classes/socket-test-helper/socket-test-helper.spec';
import { GameType } from '@app/constants/game-type';
import SocketService from '@app/services/socket-service/socket.service';
import { of, Subject } from 'rxjs';
import { Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { HighScoresController } from './high-score.controller';

const DEFAULT_HIGH_SCORES: HighScore[] = [
    { names: ['name1'], score: 120, gameType: GameType.Classic },
    { names: ['name2'], score: 220, gameType: GameType.Classic },
    { names: ['name3'], score: 320, gameType: GameType.LOG2990 },
];
const DEFAULT_PLAYER_ID = 'testPlayerID';

describe('HighScoresController', () => {
    let controller: HighScoresController;
    let httpMock: HttpTestingController;
    let socketServiceMock: SocketService;
    let socketHelper: SocketTestHelper;

    beforeEach(() => {
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketService();
        socketServiceMock['socket'] = socketHelper as unknown as Socket;
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule],
            providers: [{ provide: SocketService, useValue: socketServiceMock }],
        });
        controller = TestBed.inject(HighScoresController);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should create', () => {
        expect(controller).toBeTruthy();
    });

    describe('Configure Socket', () => {
        it('On join request, configureSocket should emit opponent name', () => {
            const spyHighScoresListEvent = spyOn(controller['highScoresListEvent'], 'next').and.callThrough();
            socketHelper.peerSideEmit('highScoresList', DEFAULT_HIGH_SCORES);
            expect(spyHighScoresListEvent).toHaveBeenCalled();
        });
    });

    describe('HTTP', () => {
        it('handleGetHighScores should get highScores with right endpoint', () => {
            spyOn(controller['socketService'], 'getId').and.returnValue(DEFAULT_PLAYER_ID);

            const httpGetSpy = spyOn(controller['http'], 'get').and.returnValue(of(true) as any);
            const endpoint = `${environment.serverUrl}/highScores/${DEFAULT_PLAYER_ID}`;

            controller.handleGetHighScores();
            expect(httpGetSpy).toHaveBeenCalledWith(endpoint);
        });

        it('resetHighScores should delete highScores with right endpoint and then call get highscores', () => {
            spyOn(controller['socketService'], 'getId').and.returnValue(DEFAULT_PLAYER_ID);

            const httpGetSpy = spyOn(controller['http'], 'get').and.returnValue(of(true) as any);
            const httpResetSpy = spyOn(controller['http'], 'delete').and.returnValue(of(true) as any);
            const endpoint = `${environment.serverUrl}/highScores`;

            controller.resetHighScores();
            expect(httpResetSpy).toHaveBeenCalledWith(endpoint);
            expect(httpGetSpy).toHaveBeenCalled();
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

        it('subscribeToHighScoresListEvent should call subscribe method on highScoresListEvent', () => {
            const subscriptionSpy = spyOn(controller['highScoresListEvent'], 'subscribe');
            controller.subscribeToHighScoresListEvent(serviceDestroyed$, callback);
            expect(subscriptionSpy).toHaveBeenCalled();
        });
    });
});
