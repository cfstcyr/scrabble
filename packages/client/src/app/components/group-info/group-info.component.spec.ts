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
import { Timer } from '@app/classes/round/timer';
import { IconComponent } from '@app/components/icon/icon.component';
import { TEST_DICTIONARY } from '@app/constants/controller-test-constants';
import { GameMode } from '@app/constants/game-mode';
import { GameType } from '@app/constants/game-type';
import { AppMaterialModule } from '@app/modules/material.module';
import { GroupPageComponent } from '@app/pages/group-page/group-page.component';
import { GroupInfoComponent } from './group-info.component';

@Component({
    template: '',
})
export class TestComponent {}

const TEST_GROUP: GroupInfo = {
    groupId: 'groupId',
    hostName: 'playerName',
    gameType: GameType.Classic,
    gameMode: GameMode.Multiplayer,
    maxRoundTime: 1,
    dictionary: TEST_DICTIONARY,
    canJoin: false,
};

describe('GroupInfoComponent', () => {
    let component: GroupInfoComponent;
    let fixture: ComponentFixture<GroupInfoComponent>;

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
                    { path: 'group', component: GroupPageComponent },
                ]),
            ],
            declarations: [GroupInfoComponent, IconComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GroupInfoComponent);
        component = fixture.componentInstance;
        component.group = TEST_GROUP;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('clicking the join button should emit the groupId', async () => {
        const spyEmit = spyOn(component.joinGroupId, 'emit').and.callFake(() => {
            return '';
        });
        component.group.canJoin = true;
        fixture.detectChanges();
        const joinButton = fixture.debugElement.nativeElement.querySelector('#join-button');
        joinButton.click();
        expect(spyEmit).toHaveBeenCalled();
    });

    it('convertTime should output the correct string using the timer in group', () => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const TIME = 90;
        const EXPECTED_TIME = new Timer(1, 30);
        component.group.maxRoundTime = TIME;
        component.ngOnInit();
        expect(component.roundTime).toEqual(EXPECTED_TIME);
    });

    it('the tooltip should be disabled if you can join the group', async () => {
        component.group.canJoin = true;
        fixture.detectChanges();
        const buttonContainer = fixture.debugElement.queryAll(By.css('.button-container'));
        const errorTooltip = buttonContainer[0].injector.get<MatTooltip>(MatTooltip);
        expect(errorTooltip.disabled).toBeTruthy();
    });

    it('the tooltip should be enabled if you cannot join the group', async () => {
        component.group.canJoin = false;
        fixture.detectChanges();
        const buttonContainer = fixture.debugElement.queryAll(By.css('.button-container'));
        const errorTooltip = buttonContainer[0].injector.get<MatTooltip>(MatTooltip);
        expect(errorTooltip.disabled).toBeFalse();
    });

    it('the tooltip should show the correct message if you cannot join the group', async () => {
        component.group.canJoin = false;
        fixture.detectChanges();
        const buttonContainer = fixture.debugElement.queryAll(By.css('.button-container'));
        const errorTooltip = buttonContainer[0].injector.get<MatTooltip>(MatTooltip);
        expect(errorTooltip.message).toEqual(`Veuillez entrer un nom valide différent de ${component.group.hostName}`);
    });
});
