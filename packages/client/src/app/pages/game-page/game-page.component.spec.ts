/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
/* eslint-disable max-classes-per-file */
import { ScrollingModule } from '@angular/cdk/scrolling';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { ActionData, ActionType } from '@app/classes/actions/action-data';
import { Player } from '@app/classes/player';
import { DefaultDialogComponent } from '@app/components/default-dialog/default-dialog.component';
import { IconComponent } from '@app/components/icon/icon.component';
import { TileComponent } from '@app/components/tile/tile.component';
import { DEFAULT_PLAYER } from '@app/constants/game-constants';
import { DIALOG_QUIT_BUTTON_CONFIRM, DIALOG_QUIT_CONTENT, DIALOG_QUIT_STAY, DIALOG_QUIT_TITLE } from '@app/constants/pages-constants';
import { GameService } from '@app/services';
import RoundManagerService from '@app/services/round-manager-service/round-manager.service';
import { of } from 'rxjs';
import { GamePageComponent } from './game-page.component';

@Component({
    template: '',
    selector: 'app-board',
})
export class MockBoardComponent {}

@Component({
    template: '',
    selector: 'app-tile-rack',
})
export class MockTileRackComponent {}

@Component({
    template: '',
    selector: 'app-information-box',
})
export class MockInformationBoxComponent {}

@Component({
    template: '',
    selector: 'app-communication-box',
})
export class MockCommunicationBoxComponent {}

export class MatDialogMock {
    open() {
        return {
            afterClosed: () => of({}),
        };
    }
}

export class RoundManagerServiceMock {
    getActivePlayer() {
        return DEFAULT_PLAYER;
    }
}

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    let gameServiceMock: GameService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [
                GamePageComponent,
                TileComponent,
                DefaultDialogComponent,
                IconComponent,
                MockBoardComponent,
                MockCommunicationBoxComponent,
                MockInformationBoxComponent,
                MockTileRackComponent,
            ],
            imports: [
                MatGridListModule,
                MatCardModule,
                MatExpansionModule,
                BrowserAnimationsModule,
                ReactiveFormsModule,
                FormsModule,
                ScrollingModule,
                HttpClientTestingModule,
                MatTooltipModule,
                RouterTestingModule.withRoutes([]),
                MatSnackBarModule,
            ],
            providers: [
                {
                    provide: MatDialog,
                    useClass: MatDialogMock,
                },
                {
                    provide: RoundManagerService,
                    useClass: RoundManagerServiceMock,
                },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        gameServiceMock = TestBed.inject(GameService);
        component['mustDisconnectGameOnLeave'] = false;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call disconnectGame if player left with quit button or no active game dialog)', () => {
        component['mustDisconnectGameOnLeave'] = false;
        const spyDiconnect = spyOn(component['reconnectionService'], 'disconnectGame').and.callFake(() => {
            return;
        });
        component.ngOnDestroy();
        expect(spyDiconnect).not.toHaveBeenCalled();
    });

    it('should not call disconnectGame if player left abnormally during game', () => {
        component['mustDisconnectGameOnLeave'] = true;
        const spyDiconnect = spyOn(component['reconnectionService'], 'disconnectGame').and.callFake(() => {
            return;
        });
        component.ngOnDestroy();
        expect(spyDiconnect).toHaveBeenCalled();
        component['mustDisconnectGameOnLeave'] = false;
    });

    it('should open the Surrender dialog when surrender-dialog-button is clicked ', () => {
        const spy = spyOn(component['dialog'], 'open');
        const surrenderButton = fixture.debugElement.nativeElement.querySelector('#surrender-dialog-button');
        surrenderButton.click();
        expect(spy).toHaveBeenCalled();
    });

    describe('endOfGame dialog', () => {
        it('should open the EndOfGame dialog on endOfGame event', () => {
            const spy = spyOn(component['dialog'], 'open');
            component['gameViewEventManagerService'].emitGameViewEvent('endOfGame', ['Mathilde']);
            expect(spy).toHaveBeenCalled();
        });

        it('should call confettis if local player is winner', () => {
            spyOn<any>(component, 'isLocalPlayerWinner').and.returnValue(true);
            const spy = spyOn<any>(component, 'throwConfettis').and.callFake(() => {
                return;
            });
            component['endOfGameDialog'](['Mathilde']);
            expect(spy).toHaveBeenCalled();
        });

        it('should not call confettis if local player is not winner', () => {
            spyOn<any>(component, 'isLocalPlayerWinner').and.returnValue(false);
            const spy = spyOn<any>(component, 'throwConfettis').and.callFake(() => {
                return;
            });
            component['endOfGameDialog'](['Mathilde']);
            expect(spy).not.toHaveBeenCalled();
        });

        it('should call isLocalPlayerWinner 3 times', () => {
            const USER1 = { username: 'user1', email: 'email1', avatar: 'avatar1' };
            spyOn<any>(component, 'throwConfettis').and.callFake(() => {
                return;
            });
            const spy = spyOn(component['gameService'], 'getLocalPlayer').and.returnValue({ publicUser: USER1 } as unknown as Player);
            component['endOfGameDialog'](['Mathilde']);
            expect(spy).toHaveBeenCalledTimes(3);
        });
    });

    describe('isLocalPlayerWinner', () => {
        const USER1 = { username: 'user1', email: 'email1', avatar: 'avatar1' };
        it('should return true if local player is winner', () => {
            spyOn(component['gameService'], 'getLocalPlayer').and.returnValue({ publicUser: USER1 } as unknown as Player);
            expect(component['isLocalPlayerWinner']([USER1.username])).toBeTrue();
        });

        it('should return false if local player is not winner', () => {
            spyOn(component['gameService'], 'getLocalPlayer').and.returnValue({ publicUser: USER1 } as unknown as Player);
            expect(component['isLocalPlayerWinner'](['Jérôme'])).toBeFalse();
        });
    });

    describe('hintButtonClicked', () => {
        const fakeData = { fake: 'data' };
        let createActionDataSpy: jasmine.Spy;
        let sendAction: jasmine.Spy;

        it('should use action service to get hint', () => {
            spyOn(component['gameService'], 'getGameId').and.returnValue('gameId');
            spyOn(component['gameService'], 'getLocalPlayerId').and.returnValue('playerId');

            createActionDataSpy = spyOn(component['actionService'], 'createActionData').and.returnValue(fakeData as unknown as ActionData);
            sendAction = spyOn(component['actionService'], 'sendAction').and.callFake(() => {
                return;
            });
            component.hintButtonClicked();
            expect(createActionDataSpy).toHaveBeenCalledWith(ActionType.HINT, {}, '', true);
            expect(sendAction).toHaveBeenCalledWith('gameId', fakeData);
        });
    });

    describe('passButtonClicked', () => {
        const fakeData = { fake: 'data' };
        let createActionDataSpy: jasmine.Spy;
        let sendAction: jasmine.Spy;

        it('should use action service to pass', () => {
            spyOn(component['gameService'], 'getGameId').and.returnValue('gameId');
            spyOn(component['gameService'], 'getLocalPlayerId').and.returnValue('playerId');

            createActionDataSpy = spyOn(component['actionService'], 'createActionData').and.returnValue(fakeData as unknown as ActionData);
            sendAction = spyOn(component['actionService'], 'sendAction').and.callFake(() => {
                return;
            });
            component.passButtonClicked();
            expect(createActionDataSpy).toHaveBeenCalledWith(ActionType.PASS, {}, '', true);
            expect(sendAction).toHaveBeenCalledWith('gameId', fakeData);
        });
    });

    describe('placeButtonClicked', () => {
        it('should sendAction through ActionService', () => {
            const spy = spyOn(gameServiceMock, 'playTilesOnBoard');

            component.placeButtonClicked();

            expect(spy).toHaveBeenCalled();
        });
    });

    describe('canPlay', () => {
        it('should not be able to play if its not the player turn', () => {
            spyOn<any>(component, 'isLocalPlayerTurn').and.returnValue(false);
            expect(component.canPlay()).toBeFalse();
        });

        it('should not be able to play if the game is over', () => {
            component['gameService'].isGameOver = true;
            expect(component.canPlay()).toBeFalse();
            component['gameService'].isGameOver = false;
        });

        it('should not be able to play if action has been played', () => {
            component['actionService'].hasActionBeenPlayed = true;
            expect(component.canPlay()).toBeFalse();
            component['actionService'].hasActionBeenPlayed = false;
        });

        it('should be able to play if the conditions are met', () => {
            spyOn<any>(component, 'isLocalPlayerTurn').and.returnValue(true);
            component['gameService'].isGameOver = false;
            component['actionService'].hasActionBeenPlayed = false;
            expect(component.canPlay()).toBeTrue();
        });
    });

    it('Clicking on quit button when the game is over should show quitting dialog', () => {
        gameServiceMock.isGameOver = true;
        const spy = spyOn<any>(component, 'openDialog').and.callFake(() => {
            return;
        });
        const buttonsContent = [DIALOG_QUIT_BUTTON_CONFIRM, DIALOG_QUIT_STAY];

        component.quitButtonClicked();
        expect(spy).toHaveBeenCalledOnceWith(DIALOG_QUIT_TITLE, DIALOG_QUIT_CONTENT, buttonsContent);
    });

    it('handlePlayerLeave should notify the playerLeavesService', () => {
        component['mustDisconnectGameOnLeave'] = true;
        const leaveSpy = spyOn(component['playerLeavesService'], 'handleLocalPlayerLeavesGame').and.callFake(() => {
            return;
        });
        component['handlePlayerLeaves']();
        expect(component['mustDisconnectGameOnLeave']).toBeFalse();
        expect(leaveSpy).toHaveBeenCalled();
    });
});
