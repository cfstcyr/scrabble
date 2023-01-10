/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable dot-notation */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-classes-per-file */
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { ConvertDialogComponent } from '@app/components/convert-dialog/convert-dialog.component';
import { DefaultDialogComponent } from '@app/components/default-dialog/default-dialog.component';
import { IconComponent } from '@app/components/icon/icon.component';
import { ERROR_SNACK_BAR_CONFIG } from '@app/constants/components-constants';
import {
    DEFAULT_LOBBY,
    DIALOG_BUTTON_CONTENT_REJECTED,
    DIALOG_CONTENT,
    DIALOG_TITLE,
    HOST_WAITING_MESSAGE,
    OPPONENT_FOUND_MESSAGE,
} from '@app/constants/pages-constants';
import GameDispatcherService from '@app/services/game-dispatcher-service/game-dispatcher.service';
import { PlayerLeavesService } from '@app/services/player-leave-service/player-leave.service';
import { of, Subject } from 'rxjs';
import { CreateWaitingPageComponent } from './create-waiting-page.component';
import SpyObj = jasmine.SpyObj;

@Component({
    template: '',
})
class TestComponent {}

export class MatDialogMock {
    open() {
        return {
            afterClosed: () => of({}),
        };
    }
}

describe('CreateWaitingPageComponent', () => {
    let component: CreateWaitingPageComponent;
    let fixture: ComponentFixture<CreateWaitingPageComponent>;
    const testOpponentName = 'testname';

    let playerLeavesServiceMock: PlayerLeavesService;

    let gameDispatcherServiceSpy: SpyObj<GameDispatcherService>;
    let gameDispatcherCreationSubject: Subject<HttpErrorResponse>;

    beforeEach(() => {
        gameDispatcherServiceSpy = jasmine.createSpyObj('GameDispatcherService', [
            'observeGameCreationFailed',
            'subscribeToJoinRequestEvent',
            'handleCancelGame',
            'handleConfirmation',
            'handleRejection',
        ]);
        gameDispatcherCreationSubject = new Subject();
        gameDispatcherServiceSpy.observeGameCreationFailed.and.returnValue(gameDispatcherCreationSubject.asObservable());
        gameDispatcherServiceSpy['joinRequestEvent'] = new Subject();
        gameDispatcherServiceSpy.subscribeToJoinRequestEvent.and.callFake(
            (componentDestroyed$: Subject<boolean>, callBack: (opponentName: string) => void) => {
                gameDispatcherServiceSpy['joinRequestEvent'].subscribe(callBack);
            },
        );
        gameDispatcherServiceSpy.handleConfirmation.and.callFake(() => {});
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CreateWaitingPageComponent, DefaultDialogComponent, ConvertDialogComponent, IconComponent],
            imports: [
                HttpClientTestingModule,
                MatProgressBarModule,
                MatCardModule,
                MatDialogModule,
                CommonModule,
                BrowserAnimationsModule,
                MatSnackBarModule,
                RouterTestingModule.withRoutes([
                    { path: 'game-creation', component: TestComponent },
                    { path: 'waiting-room', component: CreateWaitingPageComponent },
                    { path: 'game', component: TestComponent },
                ]),
            ],
            providers: [
                { provide: GameDispatcherService, useValue: gameDispatcherServiceSpy },
                {
                    provide: MatDialog,
                    useClass: MatDialogMock,
                },
                {
                    provide: ConvertDialogComponent,
                    useClass: MatDialogMock,
                },
                MatSnackBar,
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CreateWaitingPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        playerLeavesServiceMock = TestBed.inject(PlayerLeavesService);

        component.waitingRoomMessage = 'initialWaitingRoomMessage';
        component.opponentName = 'initialOpponent';
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('waitingRoomMessage should change the attributes according to the opponent name', async () => {
        component['setOpponent'](testOpponentName);
        expect(component.waitingRoomMessage).toEqual(testOpponentName + OPPONENT_FOUND_MESSAGE);
        expect(component.isOpponentFound).toEqual(true);
        expect(component.opponentName).toEqual(testOpponentName);
    });

    it('waitingRoomMessage should change to HostWaitingMessage when an opponent leaves the lobby', async () => {
        component.isOpponentFound = true;
        component['disconnectOpponent']();
        expect(component.waitingRoomMessage).toEqual(HOST_WAITING_MESSAGE);
        expect(component.isOpponentFound).toEqual(false);
        expect(component.opponentName).toEqual(undefined);
    });

    describe('ngOnInit', () => {
        it('should subscribe to gameDispatcherService joinRequestEvent and joinerLeaveGameEvent and router events', () => {
            const spySubscribeJoinRequestEvent = spyOn<any>(gameDispatcherServiceSpy['joinRequestEvent'], 'subscribe').and.returnValue(
                of(true) as any,
            );
            const spySubscribeJoinerLeaveGameEvent = spyOn<any>(playerLeavesServiceMock['joinerLeavesGameEvent'], 'subscribe').and.returnValue(
                of(true) as any,
            );

            component.ngOnInit();
            expect(spySubscribeJoinRequestEvent).toHaveBeenCalled();
            expect(spySubscribeJoinerLeaveGameEvent).toHaveBeenCalled();
        });

        it('should call handleGameCreationFail when game dispatcher updates game creation failed observable', () => {
            const handleSpy: jasmine.Spy = spyOn<any>(component, 'handleGameCreationFail').and.callFake(() => {});

            const error: HttpErrorResponse = { error: { message: 'test' } } as HttpErrorResponse;
            gameDispatcherCreationSubject.next(error);

            expect(handleSpy).toHaveBeenCalledWith(error);
        });

        it('should set roundTime and fun fact', () => {
            component['gameDispatcherService'].currentLobby = { ...DEFAULT_LOBBY, maxRoundTime: 210 };
            component.funFact = '';
            component.ngOnInit();
            expect(component.roundTime).toEqual('3:30');
            expect(component.funFact).not.toEqual('');
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
    });

    describe('ngOnDestroy', () => {
        it('ngOnDestroy should call handleCancelGame if the isStartingGame is false', () => {
            component['isStartingGame'] = false;
            gameDispatcherServiceSpy.handleCancelGame.and.callFake(() => {});

            component.ngOnDestroy();
            expect(gameDispatcherServiceSpy.handleCancelGame).toHaveBeenCalled();
        });

        it('ngOnDestroy should NOT call handleCancelGame if the isStartingGame is true', () => {
            component['isStartingGame'] = true;
            gameDispatcherServiceSpy.handleCancelGame.and.callFake(() => {});

            component.ngOnDestroy();
            expect(gameDispatcherServiceSpy.handleCancelGame).not.toHaveBeenCalled();
        });
    });

    describe('setOpponent', () => {
        it('should be called when joinRequestEvent is emittted', () => {
            const emitName = 'weirdName';
            const spySetOpponent = spyOn<any>(component, 'setOpponent').and.callFake(() => {
                return;
            });
            gameDispatcherServiceSpy['joinRequestEvent'].next(emitName);
            expect(spySetOpponent).toHaveBeenCalledWith(emitName);
        });

        it('should set attributes with right values', () => {
            component.opponentName = 'some name';
            component.waitingRoomMessage = 'some message';
            component.isOpponentFound = false;

            const newOpponentName = 'New opponent name';
            component['setOpponent'](newOpponentName);

            expect(component.opponentName).toEqual(newOpponentName);
            expect(component.waitingRoomMessage).toEqual(newOpponentName + OPPONENT_FOUND_MESSAGE);
            expect(component.isOpponentFound).toBeTrue();
        });
    });

    describe('disconnectOpponent', () => {
        it('should set attributes to right values if opponentName is defined', () => {
            component.opponentName = 'some name';
            component.waitingRoomMessage = 'some message';
            component.isOpponentFound = false;

            component['disconnectOpponent']();

            expect(component.opponentName).toBeUndefined();
            expect(component.waitingRoomMessage).toEqual(HOST_WAITING_MESSAGE);
            expect(component.isOpponentFound).toBeFalse();
        });

        it('should not change anything if there is no opponent', async () => {
            component.opponentName = undefined;

            const beforeWaitingMessage = 'some message';
            component.waitingRoomMessage = beforeWaitingMessage;
            component.isOpponentFound = true;

            component['disconnectOpponent']();

            expect(component.opponentName).toBeUndefined();
            expect(component.waitingRoomMessage).toEqual(beforeWaitingMessage);
            expect(component.isOpponentFound).toBeTrue();
        });
    });

    describe('opponentLeft', () => {
        it('opponentLeft should call disconnectOpponent', () => {
            const spy = spyOn<any>(component, 'disconnectOpponent');
            component['opponentLeft']('leaver');
            expect(spy).toHaveBeenCalled();
        });

        it('should open the dialog', () => {
            const spy = spyOn(component.dialog, 'open');
            const leaverName = 'leaver';
            component['opponentLeft'](leaverName);
            expect(spy).toHaveBeenCalledWith(DefaultDialogComponent, {
                data: {
                    title: DIALOG_TITLE,
                    content: leaverName + DIALOG_CONTENT,
                    buttons: [
                        {
                            content: DIALOG_BUTTON_CONTENT_REJECTED,
                            closeDialog: true,
                        },
                    ],
                },
            });
        });

        it('should be called when joinerLeaveGameEvent is emittted', () => {
            const emitName = 'weirdName';
            const spyOpponentLeft = spyOn<any>(component, 'opponentLeft').and.callFake(() => {
                return;
            });
            playerLeavesServiceMock['joinerLeavesGameEvent'].next(emitName);
            expect(spyOpponentLeft).toHaveBeenCalledWith(emitName);
        });
    });

    describe('confirmOpponentToServer', () => {
        it('should set isStartingGame to true', () => {
            component['isStartingGame'] = false;
            component.confirmOpponentToServer();
            expect(component['isStartingGame']).toBeTrue();
        });

        it('should call gameDispatcher.handleConfirmation if opponentName is defined', () => {
            const opponentName = 'some name';
            component.opponentName = opponentName;
            component.confirmOpponentToServer();

            expect(gameDispatcherServiceSpy.handleConfirmation).toHaveBeenCalledWith(opponentName);
        });

        it('should NOT call gameDispatcher.handleConfirmation if opponentName is undefined', () => {
            component.opponentName = undefined;
            component.confirmOpponentToServer();

            expect(gameDispatcherServiceSpy.handleConfirmation).not.toHaveBeenCalled();
        });
    });

    describe('confirmRejectionToServer', () => {
        it('should call gameDispatcher.handleConfirmation and disconnectOpponent if opponentName is defined', () => {
            const opponentName = 'some name';
            component.opponentName = opponentName;
            gameDispatcherServiceSpy.handleRejection.and.callFake(() => {});
            const disconnectOpponentSpy = spyOn<any>(component, 'disconnectOpponent').and.callFake(() => {
                return;
            });

            component.confirmRejectionToServer();

            expect(gameDispatcherServiceSpy.handleRejection).toHaveBeenCalledWith(opponentName);
            expect(disconnectOpponentSpy).toHaveBeenCalled();
        });

        it('should NOT call gameDispatcher.handleConfirmation and disconnectOpponent if opponentName is undefined', () => {
            component.opponentName = undefined;
            gameDispatcherServiceSpy.handleRejection.and.callFake(() => {});
            const disconnectOpponentSpy = spyOn<any>(component, 'disconnectOpponent').and.callFake(() => {
                return;
            });

            component.confirmRejectionToServer();

            expect(gameDispatcherServiceSpy.handleRejection).not.toHaveBeenCalled();
            expect(disconnectOpponentSpy).not.toHaveBeenCalled();
        });
    });

    describe('start button', () => {
        it('should be enabled when an opponent is found', () => {
            component.isOpponentFound = true;
            fixture.detectChanges();
            const startGameButton = fixture.nativeElement.querySelector('#start-game-button');
            expect(startGameButton.disabled).toBeFalsy();
        });

        it('should be disabled when no opponent is found', () => {
            component.isOpponentFound = false;
            fixture.detectChanges();
            const startGameButton = fixture.nativeElement.querySelector('#start-game-button');
            expect(startGameButton.disabled).toBeTruthy();
        });

        it('should call confirmOpponentToServer() on click if not disabled', () => {
            const startGameButton = fixture.debugElement.nativeElement.querySelector('#start-game-button');
            startGameButton.disabled = false;
            fixture.detectChanges();

            startGameButton.click();

            expect(gameDispatcherServiceSpy.handleConfirmation).toHaveBeenCalledWith(component.opponentName as string);
        });

        it('clicking on the startGame Button should not call confirmOpponentToServer() if there is no opponent (it is disabled)', () => {
            const startGameButton = fixture.debugElement.nativeElement.querySelector('#start-game-button');
            startGameButton.disabled = true;
            fixture.detectChanges();

            startGameButton.click();
            expect(gameDispatcherServiceSpy.handleConfirmation).not.toHaveBeenCalled();
        });
    });

    describe('rejectButton', () => {
        it('should be enabled when an opponent is found', () => {
            component.isOpponentFound = true;
            fixture.detectChanges();
            const rejectButton = fixture.nativeElement.querySelector('#reject-button');
            expect(rejectButton.disabled).toBeFalsy();
        });

        it('should be disabled  when no opponent is found', async () => {
            component.isOpponentFound = false;
            fixture.detectChanges();
            const rejectButton = fixture.nativeElement.querySelector('#reject-button');
            expect(rejectButton.disabled).toBeTruthy();
        });

        it('should call handleRejection() if an opponent is found on click if not disabled', () => {
            const rejectButton = fixture.debugElement.nativeElement.querySelector('#reject-button');
            rejectButton.disabled = false;
            fixture.detectChanges();

            const spyDisconnect = spyOn<any>(component, 'disconnectOpponent').and.callFake(() => {
                return;
            });
            gameDispatcherServiceSpy.handleRejection.withArgs(component.opponentName as string).and.callFake(() => {
                return;
            });
            rejectButton.click();

            expect(spyDisconnect).toHaveBeenCalled();
            expect(gameDispatcherServiceSpy.handleRejection).toHaveBeenCalled();
        });

        it('should not call handleRejection() and disconnectOpponent on click when disabled', () => {
            const rejectButton = fixture.debugElement.nativeElement.querySelector('#reject-button');
            rejectButton.disabled = true;
            fixture.detectChanges();

            const disconnectSpy = spyOn<any>(component, 'disconnectOpponent');
            gameDispatcherServiceSpy.handleRejection.and.callFake(() => {});
            rejectButton.click();

            expect(disconnectSpy).not.toHaveBeenCalled();
            expect(gameDispatcherServiceSpy.handleRejection).not.toHaveBeenCalled();
        });
    });

    describe('convertSolo button', () => {
        it('should be enabled when no opponent is found', () => {
            component.isOpponentFound = false;
            fixture.detectChanges();
            const convertButton = fixture.nativeElement.querySelector('#convert-solo-button');
            expect(convertButton.disabled).toBeFalsy();
        });

        it('should be disabled  when an opponent is found', async () => {
            component.isOpponentFound = true;
            fixture.detectChanges();
            const convertButton = fixture.nativeElement.querySelector('#convert-solo-button');
            expect(convertButton.disabled).toBeTruthy();
        });

        it('should call confirmConvertToSolo() if no opponent is found on click', () => {
            component.isOpponentFound = false;
            const convertButton = fixture.debugElement.nativeElement.querySelector('#convert-solo-button');
            convertButton.disabled = false;
            fixture.detectChanges();

            const spyDisconnect = spyOn(component, 'confirmConvertToSolo').and.callThrough();
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            gameDispatcherServiceSpy.handleCancelGame.and.callFake(() => {});
            convertButton.click();

            expect(spyDisconnect).toHaveBeenCalled();
            expect(gameDispatcherServiceSpy.handleCancelGame).toHaveBeenCalled();
        });
    });

    it('cancelButton should be enabled when the game is created and no opponent has joined it', () => {
        const cancelButtonButton = fixture.nativeElement.querySelector('#cancel-button');
        expect(cancelButtonButton.disabled).toBeFalsy();
    });

    describe('handleGameCreationFail', () => {
        let error: HttpErrorResponse;
        let confirmRejectionToServerSpy: jasmine.Spy;
        let snackBarSpy: jasmine.Spy;
        let routerSpy: jasmine.Spy;

        beforeEach(() => {
            error = {
                error: {
                    message: 'error',
                },
            } as HttpErrorResponse;
            confirmRejectionToServerSpy = spyOn(component, 'confirmRejectionToServer').and.callFake(() => {});
            snackBarSpy = spyOn(component['snackBar'], 'open');
            routerSpy = spyOn(component['router'], 'navigateByUrl');
            component['handleGameCreationFail'](error);
        });

        it('should call confirmRejectionToServer', () => {
            expect(confirmRejectionToServerSpy).toHaveBeenCalled();
        });

        it('should call confirmRejectionToServer', () => {
            expect(snackBarSpy).toHaveBeenCalledWith(error.error.message, 'Fermer', ERROR_SNACK_BAR_CONFIG);
        });

        it('should call confirmRejectionToServer', () => {
            expect(routerSpy).toHaveBeenCalledWith('game-creation');
        });
    });
});
