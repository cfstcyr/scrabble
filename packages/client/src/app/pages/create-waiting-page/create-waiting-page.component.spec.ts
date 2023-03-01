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
import { DefaultDialogComponent } from '@app/components/default-dialog/default-dialog.component';
import { GroupInfoDetailedComponent } from '@app/components/group-info-detailed/group-info-detailed.component';
import { IconComponent } from '@app/components/icon/icon.component';
import { RequestingUserContainerComponent } from '@app/components/requesting-user-container/requesting-user-container.component';
import { ERROR_SNACK_BAR_CONFIG } from '@app/constants/components-constants';
import { DEFAULT_GROUP } from '@app/constants/pages-constants';
import { ROUTE_GAME_CREATION } from '@app/constants/routes-constants';
import GameDispatcherService from '@app/services/game-dispatcher-service/game-dispatcher.service';
import { PublicUser } from '@common/models/user';
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
    let gameDispatcherServiceSpy: SpyObj<GameDispatcherService>;
    let gameDispatcherCreationSubject: Subject<HttpErrorResponse>;

    beforeEach(() => {
        gameDispatcherServiceSpy = jasmine.createSpyObj('GameDispatcherService', [
            'observeGameCreationFailed',
            'subscribeToJoinRequestEvent',
            'subscribeToPlayerCancelledRequestEvent',
            'subscribeToPlayerLeftGroupEvent',
            'subscribeToPlayerJoinedGroupEvent',
            'handleStart',
            'handleCancelGame',
            'handleConfirmation',
            'handleRejection',
        ]);
        gameDispatcherCreationSubject = new Subject();
        gameDispatcherServiceSpy.observeGameCreationFailed.and.returnValue(gameDispatcherCreationSubject.asObservable());
        gameDispatcherServiceSpy['joinRequestEvent'] = new Subject();
        gameDispatcherServiceSpy.subscribeToJoinRequestEvent.and.callFake(
            (componentDestroyed$: Subject<boolean>, callBack: (users: PublicUser[]) => void) => {
                gameDispatcherServiceSpy['joinRequestEvent'].subscribe(callBack);
            },
        );
        gameDispatcherServiceSpy.handleConfirmation.and.callFake(() => {});
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [
                CreateWaitingPageComponent,
                DefaultDialogComponent,
                RequestingUserContainerComponent,
                GroupInfoDetailedComponent,
                IconComponent,
            ],
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
                    { path: 'create-waiting-room', component: CreateWaitingPageComponent },
                    { path: 'game', component: TestComponent },
                ]),
            ],
            providers: [
                { provide: GameDispatcherService, useValue: gameDispatcherServiceSpy },
                {
                    provide: MatDialog,
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
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should subscribe to gameDispatcherService joinRequestEvent and joinerLeaveGameEvent and router events', () => {
            const spySubscribeJoinRequestEvent = spyOn<any>(gameDispatcherServiceSpy['joinRequestEvent'], 'subscribe').and.returnValue(
                of(true) as any,
            );
            component.ngOnInit();
            expect(spySubscribeJoinRequestEvent).toHaveBeenCalled();
        });

        it('should call handleGameCreationFail when game dispatcher updates game creation failed observable', () => {
            const handleSpy: jasmine.Spy = spyOn<any>(component, 'handleGameCreationFail').and.callFake(() => {});

            const error: HttpErrorResponse = { error: { message: 'test' } } as HttpErrorResponse;
            gameDispatcherCreationSubject.next(error);

            expect(handleSpy).toHaveBeenCalledWith(error);
        });

        it('should set currentGroup to gameDispatcher currentGroup if it exists', () => {
            component.currentGroup = DEFAULT_GROUP;
            const serviceGroup = { ...DEFAULT_GROUP, maxRoundTime: 210 };
            component['gameDispatcherService'].currentGroup = serviceGroup;

            component.ngOnInit();

            expect(component.currentGroup).toEqual(serviceGroup);
            expect(component.currentGroup).not.toEqual(DEFAULT_GROUP);
        });

        it('should set currentGroup to DEFAULT_GROUP currentGroup if gameDispatcher does not have a currentGroup', () => {
            component.currentGroup = { ...DEFAULT_GROUP, maxRoundTime: 210 };
            component['gameDispatcherService'].currentGroup = undefined;

            component.ngOnInit();

            expect(component.currentGroup).toEqual(DEFAULT_GROUP);
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

    describe('handleGameCreationFail', () => {
        let error: HttpErrorResponse;
        let snackBarSpy: jasmine.Spy;
        let routerSpy: jasmine.Spy;

        beforeEach(() => {
            error = {
                error: {
                    message: 'error',
                },
            } as HttpErrorResponse;
            snackBarSpy = spyOn(component['snackBar'], 'open');
            routerSpy = spyOn(component['router'], 'navigateByUrl');
            component['handleGameCreationFail'](error);
        });

        it('should call confirmRejectionToServer', () => {
            expect(snackBarSpy).toHaveBeenCalledWith(error.error.message, 'Fermer', ERROR_SNACK_BAR_CONFIG);
        });

        it('should call confirmRejectionToServer', () => {
            expect(routerSpy).toHaveBeenCalledWith(ROUTE_GAME_CREATION);
        });
    });
});
