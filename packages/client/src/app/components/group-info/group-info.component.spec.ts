/* eslint-disable @typescript-eslint/no-magic-numbers */
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { IconComponent } from '@app/components/icon/icon.component';
import { AppMaterialModule } from '@app/modules/material.module';
import { GroupPageComponent } from '@app/pages/group-page/group-page.component';
import { GameVisibility } from '@common/models/game-visibility';
import { Group } from '@common/models/group';
import { VirtualPlayerLevel } from '@common/models/virtual-player-level';
import { GroupInfoComponent } from './group-info.component';

@Component({
    template: '',
})
export class TestComponent {}

const USER1 = { username: 'user1', email: 'email1', avatar: 'avatar1' };
const TEST_GROUP: Group = {
    maxRoundTime: 1,
    groupId: 'idgroup',
    user1: USER1,
    virtualPlayerLevel: VirtualPlayerLevel.Beginner,
    gameVisibility: GameVisibility.Private,
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
                HttpClientModule,
                HttpClientTestingModule,
                RouterTestingModule.withRoutes([
                    { path: 'waiting', component: TestComponent },
                    { path: 'groups', component: GroupPageComponent },
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
});
