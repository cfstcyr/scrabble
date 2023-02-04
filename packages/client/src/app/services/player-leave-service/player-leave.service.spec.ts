/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable dot-notation */
import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { DEFAULT_GAME_ID, DEFAULT_LEAVER } from '@app/constants/controller-test-constants';
import { PlayerLeavesController } from '@app/controllers/player-leave-controller/player-leave.controller';
import { Subject } from 'rxjs';
import { SocketService } from '..';
import { PlayerLeavesService } from './player-leave.service';

describe('PlayerLeavesService', () => {
    let service: PlayerLeavesService;
    let playerLeavesController: PlayerLeavesController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientModule, RouterTestingModule, MatSnackBarModule],
            providers: [PlayerLeavesController, SocketService],
        });
        service = TestBed.inject(PlayerLeavesService);
        playerLeavesController = TestBed.inject(PlayerLeavesController);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call handleJoinerLeaveGame when playerLeavesController.joinerLeavesGameEvent emits', () => {
        const createGameSpy = spyOn<any>(service, 'handleJoinerLeaveGame').and.callFake(() => {
            return;
        });
        playerLeavesController['joinerLeavesGameEvent'].emit('testName');
        expect(createGameSpy).toHaveBeenCalledWith('testName');
    });

    it('should reset gameService data when playerLeavesController.resetGameEvent emits', () => {
        const eventEmitSpy = spyOn(service['gameViewEventManager'], 'emitGameViewEvent').and.callFake(() => {});
        playerLeavesController['resetGameEvent'].emit();
        expect(eventEmitSpy).toHaveBeenCalledWith('resetServices');
    });

    it('handleJoinerLeaveGame should call joinerLeavesGameEvent.next', () => {
        const joinerLeaveGameEventSpy = spyOn(service['joinerLeavesGameEvent'], 'next').and.callFake(() => {
            return;
        });
        service['handleJoinerLeaveGame'](DEFAULT_LEAVER);
        expect(joinerLeaveGameEventSpy).toHaveBeenCalled();
    });

    it('handleLocalPlayerLeavesGame should call playerLeavesController.handleLeaveGame', () => {
        const handleLeaveGameSpy = spyOn(service['playerLeavesController'], 'handleLeaveGame').and.callFake(() => {
            return;
        });
        service.handleLocalPlayerLeavesGame();
        expect(handleLeaveGameSpy).toHaveBeenCalled();
    });

    it('handleLeaveLobby should call playerLeavesController.handleLeaveGame if this.currentLobbyId is defined', () => {
        spyOn(service['gameDispatcherService'], 'getCurrentLobbyId').and.returnValue(DEFAULT_GAME_ID);
        const handleLeaveGameSpy = spyOn(service['playerLeavesController'], 'handleLeaveGame').and.callFake(() => {
            return;
        });
        service.handleLeaveLobby();
        expect(handleLeaveGameSpy).toHaveBeenCalled();
    });

    it('handleLeaveLobby should call gameDispatcherService.resetServiceData', () => {
        const handleLeaveGameSpy = spyOn<any>(service['gameDispatcherService'], 'resetServiceData').and.callFake(() => {});
        service.handleLeaveLobby();
        expect(handleLeaveGameSpy).toHaveBeenCalled();
    });

    it('ngOnDestroy should call serviceDestroyed$.next', () => {
        const nextSpy = spyOn(service['serviceDestroyed$'], 'next').and.callFake(() => {
            return;
        });
        service.ngOnDestroy();
        expect(nextSpy).toHaveBeenCalled();
    });

    it('ngOnDestroy should call serviceDestroyed$.complete', () => {
        const completeSpy = spyOn(service['serviceDestroyed$'], 'complete').and.callFake(() => {
            return;
        });
        service.ngOnDestroy();
        expect(completeSpy).toHaveBeenCalled();
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

        it('subscribeToJoinerLeavesGameEvent should call subscribe method on createGameEvent', () => {
            const subscriptionSpy = spyOn(service['joinerLeavesGameEvent'], 'subscribe');
            service.subscribeToJoinerLeavesGameEvent(serviceDestroyed$, callback);
            expect(subscriptionSpy).toHaveBeenCalled();
        });
    });
});
