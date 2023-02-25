/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
/* eslint-disable max-classes-per-file */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbstractControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { HeaderBtnComponent } from '@app/components/header-btn/header-btn.component';
import { IconComponent } from '@app/components/icon/icon.component';
import { GroupInfoComponent } from '@app/components/group-info/group-info.component';
import { NameFieldComponent } from '@app/components/name-field/name-field.component';
import { PageHeaderComponent } from '@app/components/page-header/page-header.component';
import { NO_GROUP_CAN_BE_JOINED } from '@app/constants/component-errors';
import { TEST_DICTIONARY } from '@app/constants/controller-test-constants';
import { GameMode } from '@app/constants/game-mode';
import { GameType } from '@app/constants/game-type';
import { GameDispatcherService } from '@app/services/';
import { of } from 'rxjs';
import { GroupPageComponent } from './group-page.component';
import { VirtualPlayerLevel } from '@common/models/virtual-player-level';
import { GameVisibility } from '@common/models/game-visibility';

const DEFAULT_FILTER_VALUES = {
    gameType: 'all',
};

const CLASSIC_FILTER_VALUES = {
    gameType: GameType.Classic,
};

@Component({
    template: '',
})
export class TestComponent {}

export class GameDispatcherServiceSpy extends GameDispatcherService {
    handleGroupListRequest(): void {
        return;
    }
    handleJoinGroup(): void {
        return;
    }
}

export class MatDialogMock {
    open() {
        return {
            afterClosed: () => of({}),
        };
    }
}

describe('GroupPageComponent', () => {
    let component: GroupPageComponent;
    let fixture: ComponentFixture<GroupPageComponent>;
    let gameDispatcherServiceMock: GameDispatcherService;
    let validateNameSpy: jasmine.Spy;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GroupPageComponent, NameFieldComponent, GroupInfoComponent, IconComponent, PageHeaderComponent, HeaderBtnComponent],
            imports: [
                MatInputModule,
                MatFormFieldModule,
                MatDividerModule,
                HttpClientTestingModule,
                MatDialogModule,
                MatTooltipModule,
                MatFormFieldModule,
                MatSelectModule,
                MatCardModule,
                BrowserAnimationsModule,
                FormsModule,
                ReactiveFormsModule,
                RouterTestingModule.withRoutes([
                    { path: 'join-waiting-room', component: TestComponent },
                    { path: 'group', component: GroupPageComponent },
                ]),
                MatMenuModule,
            ],
            providers: [
                GameDispatcherService,
                {
                    provide: MatDialog,
                    useClass: MatDialogMock,
                },
                MatSnackBar,
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        gameDispatcherServiceMock = TestBed.inject(GameDispatcherService);
        spyOn(gameDispatcherServiceMock, 'handleGroupListRequest').and.callFake(() => {
            return [
                { groupId: '1', playerName: 'Name1', gameType: GameType.Classic, dictionary: 'default', maxRoundTime: 60, canJoin: false },
                { groupId: '2', playerName: 'Name2', gameType: GameType.Classic, dictionary: 'default', maxRoundTime: 60, canJoin: true },
                { groupId: '3', playerName: 'Name3', gameType: GameType.LOG2990, dictionary: 'default', maxRoundTime: 90, canJoin: false },
            ];
        });
        fixture = TestBed.createComponent(GroupPageComponent);
        component = fixture.componentInstance;

        validateNameSpy = spyOn<any>(component, 'validateName');
        spyOn<any>(component.filterFormGroup.get('gameType'), 'setValidators');
        component.filterFormGroup.setValue(DEFAULT_FILTER_VALUES);

        fixture.detectChanges();
    });

    beforeEach(() => {
        component.groups = [
            {
                groupId: '1',
                hostName: 'Name1',
                maxRoundTime: 60,
                virtualPlayerLever: VirtualPlayerLevel.Beginner,
                gameVisibility: GameVisibility.Public,
                canJoin: false,
            },
            {
                groupId: '2',
                hostName: 'Name2',
                maxRoundTime: 60,
                virtualPlayerLever: VirtualPlayerLevel.Beginner,
                gameVisibility: GameVisibility.Public,
                canJoin: true,
            },
            {
                groupId: '3',
                hostName: 'Name3',
                maxRoundTime: 90,
                virtualPlayerLever: VirtualPlayerLevel.Beginner,
                gameVisibility: GameVisibility.Public,
                canJoin: false,
            },
        ];
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('validateName', () => {
        let updateAllGroupsSpy: jasmine.Spy;

        beforeEach(() => {
            validateNameSpy.and.callThrough();
            updateAllGroupsSpy = spyOn<any>(component, 'updateAllGroupsAttributes');
            updateAllGroupsSpy.and.callThrough();
        });

        it('should update canJoin attribute of the groups (use #1)', () => {
            component.playerName = 'differentName';
            component.playerNameValid = true;
            component['validateName']();
            for (const group of component.groups) {
                expect(group.canJoin).toBeTrue();
            }
        });

        it('should increment numberOfGroupsMeetingFilter correctly', () => {
            component.filterFormGroup.setValue(CLASSIC_FILTER_VALUES);
            component.numberOfGroupsMeetingFilter = 0;
            component['validateName']();
            expect(component.numberOfGroupsMeetingFilter).toEqual(2);
        });

        it('should update canJoin attribute of the groups ( use #2)', () => {
            component.playerName = 'Name1';
            component.playerNameValid = true;
            const expected = [false, true, true];
            component['validateName']();
            expect(component.groups).toBeTruthy();
            for (let i = 0; i++; i < component.groups.length) {
                expect(component.groups[i].canJoin).toEqual(expected[i]);
            }
        });

        it('should call setFormAvailability', () => {
            const setFormAvailabilitySpy = spyOn<any>(component, 'setFormAvailability');
            component['validateName']();
            expect(setFormAvailabilitySpy).toHaveBeenCalled();
        });

        it('should call updateAllGroupsAttributes', () => {
            component['validateName']();
            expect(updateAllGroupsSpy).toHaveBeenCalled();
        });
    });

    describe('setFormAvailability', () => {
        beforeEach(() => {
            component.filterFormGroup.get('gameType')?.disable();
        });

        it('should enable form if name is valid and form is disabled', () => {
            component['setFormAvailability'](true);
            expect(component.filterFormGroup.get('gameType')?.disabled).toBeFalse();
        });

        it('should not enable form if name is not valid and form is disabled', () => {
            component['setFormAvailability'](false);
            expect(component.filterFormGroup.get('gameType')?.disabled).toBeTrue();
        });

        it('should enable form if name is valid and form is disabled', () => {
            component.filterFormGroup.get('gameType')?.enable();
            component['setFormAvailability'](false);
            expect(component.filterFormGroup.get('gameType')?.disabled).toBeTrue();
        });
    });

    describe('updateGroups', () => {
        it('updateGroups should call validateName', () => {
            const spy = validateNameSpy.and.returnValue(false);
            component['updateGroups'](component.groups);
            expect(spy).toHaveBeenCalled();
        });

        it('updateGroups should set groups to right value', () => {
            component.groups = [
                {
                    groupId: '1',
                    hostName: 'Name1',
                    maxRoundTime: 60,
                    virtualPlayerLever: VirtualPlayerLevel.Beginner,
                    gameVisibility: GameVisibility.Public,
                    canJoin: false,
                },
            ];
            component['updateGroups']([]);
            expect(component.groups).toEqual([]);
        });
    });

    describe('joinRandomGroup', () => {
        let getRandomGroupSpy: jasmine.Spy;
        let joinGroupSpy: jasmine.Spy;
        let snackBarOpenSpy: jasmine.Spy;

        beforeEach(() => {
            getRandomGroupSpy = spyOn<any>(component, 'getRandomGroup');
            joinGroupSpy = spyOn(component, 'joinGroup');
            snackBarOpenSpy = spyOn(component['snackBar'], 'open');
        });

        it('should call getRandomGroup', () => {
            component.joinRandomGroup();
            expect(getRandomGroupSpy).toHaveBeenCalled();
        });

        it('should call joinGroup with group id from getRandomGroup', () => {
            const group = { groupId: 'game-id' };
            getRandomGroupSpy.and.returnValue(group);
            component.joinRandomGroup();
            expect(joinGroupSpy).toHaveBeenCalledWith(group.groupId);
        });

        it('should open snack bar if an error occurs', () => {
            getRandomGroupSpy.and.throwError('Error');
            component.joinRandomGroup();
            expect(snackBarOpenSpy).toHaveBeenCalled();
        });
    });

    describe('getRandomGroup', () => {
        it('should return a group randomly from groups list', () => {
            (component.groups as unknown[]) = [
                { groupId: '1', canJoin: true, meetFilters: true },
                { groupId: '2', canJoin: true, meetFilters: true },
                { groupId: '3', canJoin: true, meetFilters: true },
                { groupId: '4', canJoin: true, meetFilters: true },
                { groupId: '5', canJoin: true, meetFilters: true },
                { groupId: '6', canJoin: true, meetFilters: true },
            ];

            let group = component['getRandomGroup']();
            let lastGroup: unknown;
            do {
                lastGroup = group;
                group = component['getRandomGroup']();
                expect(component.groups.includes(group)).toBeTrue();
            } while (lastGroup === group);

            expect(lastGroup).not.toEqual(group); // returns random group, not always the same
        });

        it('should throw if no group', () => {
            component.groups = [];
            expect(() => component['getRandomGroup']()).toThrowError(NO_GROUP_CAN_BE_JOINED);
        });

        it('should throw if no group can be joined', () => {
            component.groups = component.groups.map((group) => ({ ...group, canJoin: false }));
            expect(() => component['getRandomGroup']()).toThrowError(NO_GROUP_CAN_BE_JOINED);
        });

        it('should throw if no group fits filters', () => {
            component.groups = component.groups.map((group) => ({ ...group, meetFilters: false }));
            expect(() => component['getRandomGroup']()).toThrowError(NO_GROUP_CAN_BE_JOINED);
        });
    });

    describe('updateAllGroupsAttributes', () => {
        it('should be called when gameType changes', () => {
            const spy = spyOn<any>(component, 'updateAllGroupsAttributes').and.callFake(() => {});
            component.filterFormGroup.patchValue({ gameType: 'LOG2990' });
            expect(spy).toHaveBeenCalled();
        });

        it('should update canJoin attribute of the groups (use #1)', () => {
            component.playerName = 'differentName';
            component.playerNameValid = true;
            component['updateAllGroupsAttributes']();
            for (const group of component.groups) {
                expect(group.canJoin).toBeTrue();
            }
        });

        it('should update canJoin attribute of the groups ( use #2)', () => {
            component.playerName = 'Name1';
            component.playerNameValid = true;
            const expected = [false, true, true];
            component['updateAllGroupsAttributes']();
            expect(component.groups).toBeTruthy();
            for (let i = 0; i++; i < component.groups.length) {
                expect(component.groups[i].canJoin).toEqual(expected[i]);
            }
        });
    });

    describe('updateGroupAttributes', () => {
        let group: GroupInfo;
        let getGameTypeSpy: jasmine.Spy;

        beforeEach(() => {
            group = {
                groupId: '1',
                hostName: 'player',
                gameType: GameType.Classic,
                gameMode: GameMode.Multiplayer,
                maxRoundTime: 0,
                dictionary: TEST_DICTIONARY,
            };

            getGameTypeSpy = spyOn(component.filterFormGroup, 'get').and.returnValue({ value: 'all' } as AbstractControl);
        });

        it('should set meetFilters based on gameType', () => {
            const data: [filter: GameType | 'all', gameType: GameType, expected: boolean][] = [
                ['all', GameType.Classic, true],
                ['all', GameType.LOG2990, true],
                [GameType.Classic, GameType.Classic, true],
                [GameType.Classic, GameType.LOG2990, false],
                [GameType.LOG2990, GameType.Classic, false],
                [GameType.LOG2990, GameType.LOG2990, true],
            ];

            for (const [filter, gameType, expected] of data) {
                group.meetFilters = undefined;
                group.gameType = gameType;
                getGameTypeSpy.and.returnValue({ value: filter } as AbstractControl);
                component['updateGroupAttributes'](group);
                expect<boolean | undefined>(group.meetFilters).toEqual(expected);
            }
        });
    });

    it('joinGroup should send to GameDispatcher service to join a group', () => {
        const gameDispatcherSpy = spyOn(gameDispatcherServiceMock, 'handleJoinGroup').and.callFake(() => {
            return;
        });
        component.joinGroup(component.groups[0].groupId);
        expect(gameDispatcherSpy).toHaveBeenCalled();
    });

    it('groupFullDialog should open the dialog component', () => {
        const spy = spyOn(component.dialog, 'open');
        component['groupFullDialog']();
        expect(spy).toHaveBeenCalled();
    });

    it('groupCanceledDialog should open the dialog component', () => {
        const spy = spyOn(component.dialog, 'open');
        component['groupCanceledDialog']();
        expect(spy).toHaveBeenCalled();
    });

    it('ngOnInit should subscribe to gameDispatcherService groupsUpdateEvent and groupFullEvent', () => {
        const spySubscribeGroupUpdateEvent = spyOn(gameDispatcherServiceMock['groupsUpdateEvent'], 'subscribe').and.returnValue(of(true) as any);
        const spySubscribeGroupFullEvent = spyOn(gameDispatcherServiceMock['groupFullEvent'], 'subscribe').and.returnValue(of(true) as any);
        const spySubscribeGroupCanceledEvent = spyOn(gameDispatcherServiceMock['canceledGameEvent'], 'subscribe').and.returnValue(of(true) as any);
        component.ngOnInit();
        expect(spySubscribeGroupUpdateEvent).toHaveBeenCalled();
        expect(spySubscribeGroupCanceledEvent).toHaveBeenCalled();
        expect(spySubscribeGroupFullEvent).toHaveBeenCalled();
    });

    it('updateGroups should be called when groupsUpdateEvent is emittted', () => {
        const emitGroups: GroupInfo[] = [
            {
                groupId: '1',
                hostName: 'Name1',
                gameType: GameType.Classic,
                gameMode: GameMode.Multiplayer,
                dictionary: TEST_DICTIONARY,
                maxRoundTime: 60,
                canJoin: false,
            },
        ];
        const spySetOpponent = spyOn<any>(component, 'updateGroups').and.callFake(() => {
            return;
        });
        gameDispatcherServiceMock['groupsUpdateEvent'].next(emitGroups);
        expect(spySetOpponent).toHaveBeenCalledWith(emitGroups);
    });

    it('groupFullDialog should be called when groupFullEvent is emittted', () => {
        const spyGroupFull = spyOn<any>(component, 'groupFullDialog').and.callFake(() => {
            return;
        });
        gameDispatcherServiceMock['groupFullEvent'].next();
        expect(spyGroupFull).toHaveBeenCalled();
    });

    it('groupCanceled should be called when groupCancelEvent is emittted', () => {
        const spyGroupCanceled = spyOn<any>(component, 'groupCanceledDialog').and.callFake(() => {
            return;
        });
        gameDispatcherServiceMock['canceledGameEvent'].next();
        expect(spyGroupCanceled).toHaveBeenCalled();
    });
});
