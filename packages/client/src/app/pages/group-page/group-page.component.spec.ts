/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
/* eslint-disable max-classes-per-file */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { PageHeaderComponent } from '@app/components/page-header/page-header.component';
import { NO_GROUP_CAN_BE_JOINED } from '@app/constants/component-errors';
import { GameDispatcherService } from '@app/services/';
import { of } from 'rxjs';
import { GroupPageComponent } from './group-page.component';
import { VirtualPlayerLevel } from '@common/models/virtual-player-level';
import { GameVisibility } from '@common/models/game-visibility';
import { Group } from '@common/models/group';
import { PublicUser } from '@common/models/user';

const USER1 = { username: 'user1', email: 'email1', avatar: 'avatar1' };
const USER2 = { username: 'user2', email: 'email2', avatar: 'avatar2' };
const USER3 = { username: 'user3', email: 'email3', avatar: 'avatar3' };
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

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GroupPageComponent, GroupInfoComponent, IconComponent, PageHeaderComponent, HeaderBtnComponent],
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
                    { path: 'groups', component: GroupPageComponent },
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
                { groupId: '1', user1: USER1, virtualPlayerLevel: VirtualPlayerLevel.Beginner, maxRoundTime: 60 },
                { groupId: '2', user1: USER1, virtualPlayerLevel: VirtualPlayerLevel.Beginner, maxRoundTime: 60 },
                { groupId: '3', user1: USER1, virtualPlayerLevel: VirtualPlayerLevel.Beginner, maxRoundTime: 90 },
            ];
        });
        fixture = TestBed.createComponent(GroupPageComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();
    });

    beforeEach(() => {
        component.groups = [
            {
                groupId: '1',
                maxRoundTime: 60,
                virtualPlayerLevel: VirtualPlayerLevel.Beginner,
                gameVisibility: GameVisibility.Public,
                user1: USER1,
            },
            {
                groupId: '2',
                maxRoundTime: 60,
                virtualPlayerLevel: VirtualPlayerLevel.Beginner,
                gameVisibility: GameVisibility.Public,
                user1: USER2,
            },
            {
                groupId: '3',
                maxRoundTime: 90,
                virtualPlayerLevel: VirtualPlayerLevel.Beginner,
                gameVisibility: GameVisibility.Public,
                user1: USER3,
            },
        ];
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('updateGroups', () => {
        it('updateGroups should set groups to right value', () => {
            component.groups = [
                {
                    groupId: '1',
                    maxRoundTime: 60,
                    virtualPlayerLevel: VirtualPlayerLevel.Beginner,
                    gameVisibility: GameVisibility.Public,
                    user1: USER1,
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
                { groupId: '1' },
                { groupId: '2' },
                { groupId: '3' },
                { groupId: '4' },
                { groupId: '5' },
                { groupId: '6' },
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
            component.groups = [
                {
                    groupId: '1',
                    maxRoundTime: 60,
                    virtualPlayerLevel: VirtualPlayerLevel.Beginner,
                    gameVisibility: GameVisibility.Public,
                    user1: USER1,
                    user2: {} as unknown as PublicUser,
                    user3: {} as unknown as PublicUser,
                    user4: {} as unknown as PublicUser,
                },
            ];

            expect(() => component['getRandomGroup']()).toThrowError(NO_GROUP_CAN_BE_JOINED);
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

    it('ngOnInit should subscribe to gameDispatcherService groupsUpdateEvent ', () => {
        const spySubscribeGroupUpdateEvent = spyOn(gameDispatcherServiceMock['groupsUpdateEvent'], 'subscribe').and.returnValue(of(true) as any);
        component.ngOnInit();
        expect(spySubscribeGroupUpdateEvent).toHaveBeenCalled();
    });

    it('updateGroups should be called when groupsUpdateEvent is emittted', () => {
        const emitGroups: Group[] = [
            {
                groupId: '1',
                maxRoundTime: 60,
                virtualPlayerLevel: VirtualPlayerLevel.Beginner,
                gameVisibility: GameVisibility.Public,
                user1: USER1,
            },
            {
                groupId: '2',
                maxRoundTime: 60,
                virtualPlayerLevel: VirtualPlayerLevel.Beginner,
                gameVisibility: GameVisibility.Public,
                user1: USER2,
            },
            {
                groupId: '3',
                maxRoundTime: 90,
                virtualPlayerLevel: VirtualPlayerLevel.Beginner,
                gameVisibility: GameVisibility.Public,
                user1: USER3,
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
});
