/* eslint-disable @typescript-eslint/no-magic-numbers */
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { LobbyInfo } from '@app/classes/communication';
import { Timer } from '@app/classes/round/timer';
import { IconComponent } from '@app/components/icon/icon.component';
import { TEST_DICTIONARY } from '@app/constants/controller-test-constants';
import { GameMode } from '@app/constants/game-mode';
import { GameType } from '@app/constants/game-type';
import { AppMaterialModule } from '@app/modules/material.module';
import { LobbyPageComponent } from '@app/pages/lobby-page/lobby-page.component';
import { LobbyInfoComponent } from './lobby-info.component';

@Component({
    template: '',
})
export class TestComponent {}

const TEST_LOBBY: LobbyInfo = {
    lobbyId: 'lobbyId',
    hostName: 'playerName',
    gameType: GameType.Classic,
    gameMode: GameMode.Multiplayer,
    maxRoundTime: 1,
    dictionary: TEST_DICTIONARY,
    canJoin: false,
};

describe('LobbyInfoComponent', () => {
    let component: LobbyInfoComponent;
    let fixture: ComponentFixture<LobbyInfoComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                MatIconModule,
                MatButtonModule,
                MatTooltipModule,
                ReactiveFormsModule,
                CommonModule,
                MatInputModule,
                BrowserAnimationsModule,
                AppMaterialModule,
                MatFormFieldModule,
                FormsModule,
                RouterTestingModule.withRoutes([
                    { path: 'waiting', component: TestComponent },
                    { path: 'lobby', component: LobbyPageComponent },
                ]),
            ],
            declarations: [LobbyInfoComponent, IconComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LobbyInfoComponent);
        component = fixture.componentInstance;
        component.lobby = TEST_LOBBY;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('clicking the join button should emit the lobbyId', async () => {
        const spyEmit = spyOn(component.joinLobbyId, 'emit').and.callFake(() => {
            return '';
        });
        component.lobby.canJoin = true;
        fixture.detectChanges();
        const joinButton = fixture.debugElement.nativeElement.querySelector('#join-button');
        joinButton.click();
        expect(spyEmit).toHaveBeenCalled();
    });

    it('convertTime should output the correct string using the timer in Lobby', () => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const TIME = 90;
        const EXPECTED_TIME = new Timer(1, 30);
        component.lobby.maxRoundTime = TIME;
        component.ngOnInit();
        expect(component.roundTime).toEqual(EXPECTED_TIME);
    });

    it('the tooltip should be disabled if you can join the lobby', async () => {
        component.lobby.canJoin = true;
        fixture.detectChanges();
        const buttonContainer = fixture.debugElement.queryAll(By.css('.button-container'));
        const errorTooltip = buttonContainer[0].injector.get<MatTooltip>(MatTooltip);
        expect(errorTooltip.disabled).toBeTruthy();
    });

    it('the tooltip should be enabled if you cannot join the lobby', async () => {
        component.lobby.canJoin = false;
        fixture.detectChanges();
        const buttonContainer = fixture.debugElement.queryAll(By.css('.button-container'));
        const errorTooltip = buttonContainer[0].injector.get<MatTooltip>(MatTooltip);
        expect(errorTooltip.disabled).toBeFalse();
    });

    it('the tooltip should show the correct message if you cannot join the lobby', async () => {
        component.lobby.canJoin = false;
        fixture.detectChanges();
        const buttonContainer = fixture.debugElement.queryAll(By.css('.button-container'));
        const errorTooltip = buttonContainer[0].injector.get<MatTooltip>(MatTooltip);
        expect(errorTooltip.message).toEqual(`Veuillez entrer un nom valide différent de ${component.lobby.hostName}`);
    });
});
