/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavigationEnd, NavigationStart, Router, RouterEvent } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { LobbyInfo } from '@app/classes/communication';
import { IconComponent } from '@app/components/icon/icon.component';
import { DEFAULT_LOBBY } from '@app/constants/pages-constants';
import { GameDispatcherService } from '@app/services/';
import { of, Subject } from 'rxjs';
import { JoinWaitingPageComponent } from './join-waiting-page.component';

@Component({
    template: '',
})
class TestComponent {}

const EMPTY_LOBBY = {} as unknown as LobbyInfo;

const DEFAULT_NAME = 'playerName';

describe('JoinWaitingPageComponent', () => {
    let component: JoinWaitingPageComponent;
    let fixture: ComponentFixture<JoinWaitingPageComponent>;
    const opponentName = 'testName';
    let gameDispatcherServiceMock: GameDispatcherService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [JoinWaitingPageComponent, IconComponent],
            imports: [
                MatDialogModule,
                MatCardModule,
                MatProgressBarModule,
                BrowserAnimationsModule,
                HttpClientTestingModule,
                RouterTestingModule.withRoutes([
                    { path: 'lobby', component: TestComponent },
                    { path: 'join-waiting-room', component: JoinWaitingPageComponent },
                ]),
            ],
            providers: [GameDispatcherService],
        }).compileComponents();
    });

    beforeEach(() => {
        gameDispatcherServiceMock = TestBed.inject(GameDispatcherService);
        gameDispatcherServiceMock.currentLobby = DEFAULT_LOBBY;
        gameDispatcherServiceMock.currentName = DEFAULT_NAME;
        fixture = TestBed.createComponent(JoinWaitingPageComponent);
        component = fixture.componentInstance;
        component.currentLobby = EMPTY_LOBBY;
        component.currentName = '';
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('playerRejected should open the rejected dialog when player is rejected', () => {
        const spy = spyOn(component.dialog, 'open');
        component['playerRejected'](opponentName);
        expect(spy).toHaveBeenCalled();
    });

    it('hostHasCanceled should open the cancel dialog when host cancels the game', () => {
        const spy = spyOn(component.dialog, 'open');
        component['hostHasCanceled'](opponentName);
        expect(spy).toHaveBeenCalled();
    });

    describe('ngOnInit', () => {
        it('ngOnInit should set the values to the gameDispatcherService lobby and name (currentLobby defined)', () => {
            component.currentLobby = EMPTY_LOBBY;
            component.currentName = '';
            component.ngOnInit();
            expect(component.currentLobby).toEqual(DEFAULT_LOBBY);
            expect(component.currentName).toEqual(DEFAULT_NAME);
        });

        it('should set roundTime, currentName and fun fact', () => {
            component['gameDispatcherService'].currentLobby = { ...DEFAULT_LOBBY, maxRoundTime: 210 };
            component['gameDispatcherService'].currentName = 'Mathilde';
            component.funFact = '';
            component.currentName = '';
            component.ngOnInit();
            expect(component.roundTime).toEqual('3:30');
            expect(component.funFact).not.toEqual('');
            expect(component.currentName).toEqual('Mathilde');
        });

        it('should set currentLobby to gameDispatcher currentLobby if it exists', () => {
            component.currentLobby = DEFAULT_LOBBY;
            const serviceLobby = { ...DEFAULT_LOBBY, maxRoundTime: 210 };
            component['gameDispatcherService'].currentLobby = serviceLobby;

            component.ngOnInit();

            expect(component.currentLobby).toEqual(serviceLobby);
            expect(component.currentLobby).not.toEqual(DEFAULT_LOBBY);
        });

        it('should set currentLobby to DEFAULT_LOBBY currentLobby if gameDispatcher does not have a currentLobby', () => {
            component.currentLobby = { ...DEFAULT_LOBBY, maxRoundTime: 210, hostName: 'Alexandre' };
            component['gameDispatcherService'].currentLobby = undefined;

            component.ngOnInit();

            expect(component.currentLobby).toEqual(DEFAULT_LOBBY);
        });

        it('ngOnInit should call the get the gameDispatcherService lobby and playerName ', () => {
            const spySubscribeCanceledGameEvent = spyOn(gameDispatcherServiceMock['canceledGameEvent'], 'subscribe').and.returnValue(of(true) as any);
            const spySubscribeJoinerRejectedEvent = spyOn(gameDispatcherServiceMock['joinerRejectedEvent'], 'subscribe').and.returnValue(
                of(true) as any,
            );
            // Create a new component once spies have been applied
            fixture = TestBed.createComponent(JoinWaitingPageComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();

            expect(spySubscribeCanceledGameEvent).toHaveBeenCalled();
            expect(spySubscribeJoinerRejectedEvent).toHaveBeenCalled();
        });

        it('ngOnInit should subscribe to router events', () => {
            const routingSubscriptionSpy = spyOn(component['router'].events, 'subscribe');
            component.ngOnInit();
            expect(routingSubscriptionSpy).toHaveBeenCalled();
        });
    });

    describe('routerChangeMethod', () => {
        it('routerChangeMethod should call handleLeaveLobby if the url is diffrent from /game ', () => {
            const spyHandleLeaveLobby = spyOn(component['playerLeavesService'], 'handleLeaveLobby').and.returnValue(of(true) as any);
            // Create a new component once spies have been applied
            component['routerChangeMethod']('notgame');
            expect(spyHandleLeaveLobby).toHaveBeenCalled();
        });

        it('routerChangeMethod should not call handleLeaveLobby if the url is /game ', () => {
            const spyHandleLeaveLobby = spyOn(component['playerLeavesService'], 'handleLeaveLobby').and.returnValue(of(true) as any);
            component['routerChangeMethod']('/game');
            expect(spyHandleLeaveLobby).not.toHaveBeenCalled();
        });

        it('routerChangeMethod should be called if router event NavigationStart occurs', () => {
            const routerChangeMethodSpy = spyOn<any>(component, 'routerChangeMethod').and.callFake(() => {
                return;
            });
            const event = new NavigationStart(1, '/join-waiting-page');
            (TestBed.inject(Router).events as Subject<RouterEvent>).next(event);
            expect(routerChangeMethodSpy).toHaveBeenCalled();
        });

        it('routerChangeMethod should be called if router event NavigationStart occurs', () => {
            const routerChangeMethodSpy = spyOn<any>(component, 'routerChangeMethod').and.callFake(() => {
                return;
            });
            const event = new NavigationEnd(1, '/join-waiting-page', '/lobby');
            (TestBed.inject(Router).events as Subject<RouterEvent>).next(event);
            expect(routerChangeMethodSpy).not.toHaveBeenCalled();
        });
    });

    it('playerRejected should be called when joinerRejectedEvent is emittted', () => {
        const emitName = 'weirdName';
        const spyPlayerRejected = spyOn<any>(component, 'playerRejected').and.callFake(() => {
            return;
        });
        gameDispatcherServiceMock['joinerRejectedEvent'].next(emitName);
        expect(spyPlayerRejected).toHaveBeenCalledWith(emitName);
    });

    it('hostHasCanceled should be called when canceledGameEvent is emittted', () => {
        const emitName = 'weirdName';
        const spyHostHasCanceled = spyOn<any>(component, 'hostHasCanceled').and.callFake(() => {
            return;
        });
        gameDispatcherServiceMock['canceledGameEvent'].next(emitName);
        expect(spyHostHasCanceled).toHaveBeenCalledWith(emitName);
    });

    it('onBeforeUnload should call handleLeaveLobby', () => {
        const spyhandleLeaveLobby = spyOn(component['playerLeavesService'], 'handleLeaveLobby').and.callFake(() => {
            return;
        });

        component.onBeforeUnload();
        expect(spyhandleLeaveLobby).toHaveBeenCalled();
    });

    it('onBeforeUnload should call be handleLeaveLobby', () => {
        const spyHandleLeaveLobby = spyOn(component['playerLeavesService'], 'handleLeaveLobby').and.callFake(() => {
            return;
        });
        component.onBeforeUnload();
        expect(spyHandleLeaveLobby).toHaveBeenCalled();
    });
});
