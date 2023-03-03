/* eslint-disable max-lines */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Player } from '@app/classes/player';
import { PlayerContainer } from '@app/classes/player/player-container';
import { Timer } from '@app/classes/round/timer';
import { IconComponent } from '@app/components/icon/icon.component';
import { DEFAULT_PLAYER, SECONDS_TO_MILLISECONDS } from '@app/constants/game-constants';
import { GameService } from '@app/services';
import { GameViewEventManagerService } from '@app/services/game-view-event-manager-service/game-view-event-manager.service';
import RoundManagerService from '@app/services/round-manager-service/round-manager.service';
import { UNKOWN_USER } from '@common/models/user';
import { BehaviorSubject, Observable, Subject, Subscription, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InformationBoxComponent } from './information-box.component';
import SpyObj = jasmine.SpyObj;

const USER1 = { username: 'user1', email: 'email1', avatar: 'avatar1' };
const USER2 = { username: 'user2', email: 'email2', avatar: 'avatar2' };
class MockRoundManager {
    pTimerSource: BehaviorSubject<[timer: Timer, activePlayer: Player]> = new BehaviorSubject<[timer: Timer, activePlayer: Player]>([
        new Timer(0, 0),
        DEFAULT_PLAYER,
    ]);
    pTimer: Observable<[timer: Timer, activePlayer: Player]>;
    pEndRoundEvent: Subject<void> = new Subject();
    pActivePlayer: Player = new Player('mockId', UNKOWN_USER, []);

    get timerSource(): BehaviorSubject<[timer: Timer, activePlayer: Player]> {
        return this.pTimerSource;
    }

    get timer(): Observable<[timer: Timer, activePlayer: Player]> {
        return this.timerSource.asObservable();
    }
    get endRoundEvent(): Subject<void> {
        return this.pEndRoundEvent;
    }

    get activePlayer(): Player {
        return this.pActivePlayer;
    }

    getActivePlayer(): Player | null {
        return this.activePlayer;
    }
    // eslint-disable-next-line no-unused-vars
    subscribeToEndRoundEvent(destroy$: Observable<boolean>, next: () => void): Subscription {
        return this.pEndRoundEvent.pipe(takeUntil(destroy$)).subscribe(next);
    }
}

describe('InformationBoxComponent', () => {
    let component: InformationBoxComponent;
    let fixture: ComponentFixture<InformationBoxComponent>;
    let gameServiceSpy: SpyObj<GameService>;
    let mockRoundManager: MockRoundManager;
    let gameViewEventManagerSpy: SpyObj<GameViewEventManagerService>;

    beforeEach(() => {
        gameServiceSpy = jasmine.createSpyObj('GameService', ['getPlayerByNumber', 'getLocalPlayer']);
        mockRoundManager = new MockRoundManager();

        const reRender$ = new Subject();
        const gameInitialized$ = new Subject();
        gameViewEventManagerSpy = jasmine.createSpyObj('GameViewEventManagerService', ['emitGameViewEvent', 'subscribeToGameViewEvent']);
        gameViewEventManagerSpy.emitGameViewEvent.and.callFake((eventType: string) => {
            switch (eventType) {
                case 'reRender':
                    reRender$.next();
                    break;
                case 'gameInitialized':
                    gameInitialized$.next();
                    break;
            }
        });

        gameViewEventManagerSpy.subscribeToGameViewEvent.and.callFake((eventType: string, destroy$: Observable<boolean>, next: any): Subscription => {
            switch (eventType) {
                case 'reRender':
                    return reRender$.pipe(takeUntil(destroy$)).subscribe(next);
                case 'gameInitialized':
                    return gameInitialized$.pipe(takeUntil(destroy$)).subscribe(next);
            }
            return new Subscription();
        });
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientModule, MatCardModule, MatTooltipModule],
            declarations: [InformationBoxComponent, IconComponent],
            providers: [
                { provide: GameService, useValue: gameServiceSpy },
                { provide: RoundManagerService, useValue: mockRoundManager },
                { provide: GameViewEventManagerService, useValue: gameViewEventManagerSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(InformationBoxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        beforeEach(() => {
            gameServiceSpy.isGameSetUp = true;
        });

        afterAll(() => {
            jasmine.clock().uninstall();
        });

        it('ngOnInit should create ngUnsubscribe object', () => {
            spyOnProperty<any>(mockRoundManager, 'timer', 'get').and.returnValue(null);
            spyOnProperty<any>(mockRoundManager, 'endRoundEvent', 'get').and.returnValue(null);
            component.ngOnInit();
            expect(component['componentDestroyed$']).toBeTruthy();
        });

        it('ngOnInit should create Timer object', () => {
            spyOnProperty<any>(mockRoundManager, 'timer', 'get').and.returnValue(null);
            spyOnProperty<any>(mockRoundManager, 'endRoundEvent', 'get').and.returnValue(null);
            component.ngOnInit();
            expect(component.timer).toBeTruthy();
        });

        it('ngOnInit should subscribe to RoundManager timer property', () => {
            const timerObs = new Observable<Timer>();
            const pipedObservable = timerObs.pipe();
            const pipedSpy = spyOn(pipedObservable, 'subscribe');
            spyOnProperty<any>(mockRoundManager, 'timer', 'get').and.returnValue(timerObs);
            spyOn(mockRoundManager.timer, 'pipe').and.returnValue(pipedObservable);
            component.ngOnInit();
            expect(pipedSpy).toHaveBeenCalled();
        });

        it('ngOnInit timer subscription should call startTimer', () => {
            const startTimerSpy = spyOn<any>(component, 'startTimer').and.callFake(() => {
                return;
            });
            spyOn<any>(component, 'updateActivePlayerBorder').and.callFake(() => {
                return false;
            });
            component.ngOnInit();
            const newTimer = new Timer(1, 0);
            mockRoundManager.timerSource.next([newTimer, DEFAULT_PLAYER]);
            expect(startTimerSpy).toHaveBeenCalledWith(newTimer);
        });

        it('ngOnInit timer subscription should call updateActivePlayerBorder', () => {
            spyOn<any>(component, 'startTimer').and.callFake(() => {
                return;
            });
            const updateBorderSpy = spyOn<any>(component, 'updateActivePlayerBorder').and.callFake(() => {
                return false;
            });
            component.ngOnInit();
            const newTimer = new Timer(1, 0);
            mockRoundManager.timerSource.next([newTimer, DEFAULT_PLAYER]);
            expect(updateBorderSpy).toHaveBeenCalled();
        });

        it('ngOnInit should subscribe to RoundManager endRoundEvent', () => {
            const spy = spyOn(mockRoundManager, 'subscribeToEndRoundEvent');
            component.ngOnInit();
            expect(spy).toHaveBeenCalled();
        });

        it('ngOnInit should NOT subscribe to RoundManager endRoundEvent if game is not setup', () => {
            const subscribeSpy = spyOn(mockRoundManager.endRoundEvent, 'subscribe');
            component['gameService'].isGameSetUp = false;
            component.ngOnInit();
            expect(subscribeSpy).not.toHaveBeenCalled();
        });

        it('should call endRound() on round manager end round event', () => {
            const spy = spyOn<any>(component, 'endRound');
            component['setupGame']();
            mockRoundManager.endRoundEvent.next();
            expect(spy).toHaveBeenCalled();
        });

        it('should call startTimer and updateActivePlayerBorder on round manager timer event', () => {
            const startTimerSpy = spyOn<any>(component, 'startTimer');
            const updateBorderSpy = spyOn<any>(component, 'updateActivePlayerBorder');
            component['setupGame']();
            mockRoundManager.timerSource.next([{} as unknown as Timer, {} as unknown as Player]);
            expect(startTimerSpy).toHaveBeenCalled();
            expect(updateBorderSpy).toHaveBeenCalled();
        });

        it('ngOnInit endRoundEvent subscription should call the functions to end the round', () => {
            const ngOnDestroySpy = spyOn<any>(component, 'onDestroy');
            const ngOnInitSpy = spyOn(component, 'ngOnInit');

            gameViewEventManagerSpy.emitGameViewEvent('reRender');

            expect(ngOnDestroySpy).toHaveBeenCalled();
            expect(ngOnInitSpy).toHaveBeenCalled();
        });

        it('ngOnInit reRender subscription should call the functions to rerender the component', () => {
            const ngOnDestroySpy = spyOn<any>(component, 'onDestroy');
            const ngOnInitSpy = spyOn(component, 'ngOnInit');
            const updateBorderSpy = spyOn<any>(component, 'updateActivePlayerBorder');

            gameViewEventManagerSpy.emitGameViewEvent('reRender');

            expect(ngOnDestroySpy).toHaveBeenCalled();
            expect(ngOnInitSpy).toHaveBeenCalled();
            expect(updateBorderSpy).toHaveBeenCalled();
        });
    });

    describe('onDestroy', () => {
        beforeEach(() => {
            spyOnProperty<any>(mockRoundManager, 'timer', 'get').and.returnValue(null);
        });

        it('should always call next and complete on ngUnsubscribe', () => {
            const ngUnsubscribeNextSpy = spyOn(component['componentDestroyed$'], 'next');
            const ngUnsubscribeCompleteSpy = spyOn(component['componentDestroyed$'], 'complete');

            component['onDestroy']();
            expect(ngUnsubscribeNextSpy).toHaveBeenCalled();
            expect(ngUnsubscribeCompleteSpy).toHaveBeenCalled();
        });
    });

    describe('ngOndestroy', () => {
        it('should call onDestroy', () => {
            const onDestroySpy = spyOn<any>(component, 'onDestroy');

            component.ngOnDestroy();
            expect(onDestroySpy).toHaveBeenCalled();
        });
    });

    describe('startTimer', () => {
        it('StartTimer should update timer attribute', () => {
            const observable = new Observable<number>();
            spyOn<any>(component, 'createTimer').and.returnValue(observable);
            spyOn(observable, 'subscribe').and.callFake(() => {
                return new Subscription();
            });
            spyOn<any>(component, 'updateActivePlayerBorder').and.callFake(() => {
                return false;
            });
            const newTimer: Timer = new Timer(1, 0);
            component['startTimer'](newTimer);
            expect(component.timer).toEqual(newTimer);
        });

        it('StartTimer should create TimerSource', () => {
            const observable = new Observable<number>();
            spyOn<any>(component, 'createTimer').and.returnValue(observable);
            spyOn(observable, 'subscribe').and.callFake(() => {
                return new Subscription();
            });
            spyOn<any>(component, 'updateActivePlayerBorder').and.callFake(() => {
                return false;
            });
            const newTimer: Timer = new Timer(1, 0);
            component['startTimer'](newTimer);
            expect(component['timerSource']).toEqual(observable);
        });

        it('StartTimer should subscribe timerSubscription to timerSource and call timer.decrement', () => {
            const newTimer: Timer = new Timer(1, 0);
            spyOn<any>(component, 'updateActivePlayerBorder').and.callFake(() => {
                return false;
            });
            component['startTimer'](newTimer);
            expect(component['timerSubscription']).toBeTruthy();
        });
    });

    describe('endRound', () => {
        it('EndRound should set Timer to 0:00', () => {
            component['endRound']();
            expect(component.timer).toEqual(new Timer(0, 0));
        });

        it('EndRound should unsubscribe from timerSubscription', () => {
            component['startTimer'](new Timer(1, 0));
            const spy = spyOn(component['timerSubscription'], 'unsubscribe');
            component['endRound']();
            expect(spy).toHaveBeenCalled();
        });

        it('EndRound should not unsubscribe if timerSubscription is not defined', () => {
            component['startTimer'](new Timer(1, 0));
            const spy = spyOn(component['timerSubscription'], 'unsubscribe');
            component['timerSubscription'] = undefined as unknown as Subscription;
            component['endRound']();
            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('updateActivePlayerBorder', () => {
        let player1: Player;
        let player2: Player;
        beforeEach(() => {
            player1 = new Player('1', USER1, []);
            player2 = new Player('2', USER2, []);
            gameServiceSpy.getPlayerByNumber.and.callFake((id: number) => {
                return id === 1 ? player1 : player2;
            });
        });

        it('updateActivePlayerBorder should set no border if provided active player is undefined', () => {
            component['updateActivePlayerBorder'](undefined);

            expect(component.isPlayer1Active).toBeFalse();
            expect(component.isPlayer2Active).toBeFalse();
        });

        it('updateActivePlayerBorder should set border on player1 if player1 is active', () => {
            component['updateActivePlayerBorder'](player1);

            expect(component.isPlayer1Active).toBeTrue();
            expect(component.isPlayer2Active).toBeFalse();
        });

        it('updateActivePlayerBorder should set border on player2 if player2 is active', () => {
            component['updateActivePlayerBorder'](player2);

            expect(component.isPlayer2Active).toBeTrue();
            expect(component.isPlayer1Active).toBeFalse();
        });
    });

    describe('getPlayer', () => {
        beforeEach(() => {
            gameServiceSpy['playerContainer'] = new PlayerContainer(DEFAULT_PLAYER.id);
        });

        it('getPlayer1 should return current gameservice player1 if it exists', () => {
            gameServiceSpy.getPlayerByNumber.and.returnValue(DEFAULT_PLAYER);
            expect(component.getPlayer1()).toEqual(DEFAULT_PLAYER);
        });

        it('getPlayer1 should return a new player if gameservice player1 does not exist', () => {
            gameServiceSpy.getPlayerByNumber.and.returnValue(undefined as unknown as Player);
            expect(component.getPlayer1()).toEqual(new Player('', { username: 'Player1', email: '', avatar: '' }, []));
        });

        it('getPlayer2 should return current gameservice player2 if it exists', () => {
            gameServiceSpy.getPlayerByNumber.and.returnValue(DEFAULT_PLAYER);
            expect(component.getPlayer2()).toEqual(DEFAULT_PLAYER);
        });

        it('getPlayer2 should return a new player if gameservice player2 does not exist', () => {
            gameServiceSpy.getPlayerByNumber.and.returnValue(undefined as unknown as Player);
            expect(component.getPlayer2()).toEqual(new Player('', { username: 'Player2', email: '', avatar: '' }, []));
        });
    });

    it('CreateTimer should return timer from rxjs', () => {
        const timerEl = component['createTimer'](SECONDS_TO_MILLISECONDS);
        expect(typeof timerEl).toEqual(typeof timer(0, SECONDS_TO_MILLISECONDS));
    });

    it('isTimerRunning should return true if it is running', () => {
        component['timerSubscription'] = { closed: false } as unknown as Subscription;
        expect(component.isTimerRunning()).toBeTrue();
    });

    it('isTimerRunning should return false if it is not running', () => {
        component['timerSubscription'] = { closed: true } as unknown as Subscription;
        expect(component.isTimerRunning()).toBeFalse();
    });
});
