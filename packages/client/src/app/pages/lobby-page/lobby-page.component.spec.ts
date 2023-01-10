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
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { LobbyInfo } from '@app/classes/communication';
import { IconComponent } from '@app/components/icon/icon.component';
import { LobbyInfoComponent } from '@app/components/lobby-info/lobby-info.component';
import { NameFieldComponent } from '@app/components/name-field/name-field.component';
import { PageHeaderComponent } from '@app/components/page-header/page-header.component';
import { NO_LOBBY_CAN_BE_JOINED } from '@app/constants/component-errors';
import { TEST_DICTIONARY } from '@app/constants/controller-test-constants';
import { GameMode } from '@app/constants/game-mode';
import { GameType } from '@app/constants/game-type';
import { GameDispatcherService } from '@app/services/';
import { of } from 'rxjs';
import { LobbyPageComponent } from './lobby-page.component';

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
    handleLobbyListRequest(): void {
        return;
    }
    handleJoinLobby(): void {
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

describe('LobbyPageComponent', () => {
    let component: LobbyPageComponent;
    let fixture: ComponentFixture<LobbyPageComponent>;
    let gameDispatcherServiceMock: GameDispatcherService;
    let validateNameSpy: jasmine.Spy;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [LobbyPageComponent, NameFieldComponent, LobbyInfoComponent, IconComponent, PageHeaderComponent],
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
                    { path: 'lobby', component: LobbyPageComponent },
                ]),
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
        spyOn(gameDispatcherServiceMock, 'handleLobbyListRequest').and.callFake(() => {
            return [
                { lobbyId: '1', playerName: 'Name1', gameType: GameType.Classic, dictionary: 'default', maxRoundTime: 60, canJoin: false },
                { lobbyId: '2', playerName: 'Name2', gameType: GameType.Classic, dictionary: 'default', maxRoundTime: 60, canJoin: true },
                { lobbyId: '3', playerName: 'Name3', gameType: GameType.LOG2990, dictionary: 'default', maxRoundTime: 90, canJoin: false },
            ];
        });
        fixture = TestBed.createComponent(LobbyPageComponent);
        component = fixture.componentInstance;

        validateNameSpy = spyOn<any>(component, 'validateName');
        spyOn<any>(component.filterFormGroup.get('gameType'), 'setValidators');
        component.filterFormGroup.setValue(DEFAULT_FILTER_VALUES);

        fixture.detectChanges();
    });

    beforeEach(() => {
        component.lobbies = [
            {
                lobbyId: '1',
                hostName: 'Name1',
                gameType: GameType.Classic,
                gameMode: GameMode.Multiplayer,
                dictionary: TEST_DICTIONARY,
                maxRoundTime: 60,
                canJoin: false,
            },
            {
                lobbyId: '2',
                hostName: 'Name2',
                gameType: GameType.Classic,
                gameMode: GameMode.Multiplayer,
                dictionary: TEST_DICTIONARY,
                maxRoundTime: 60,
                canJoin: true,
            },
            {
                lobbyId: '3',
                hostName: 'Name3',
                gameType: GameType.LOG2990,
                gameMode: GameMode.Multiplayer,
                dictionary: TEST_DICTIONARY,
                maxRoundTime: 90,
                canJoin: false,
            },
        ];
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('validateName', () => {
        let updateAllLobbiesSpy: jasmine.Spy;

        beforeEach(() => {
            validateNameSpy.and.callThrough();
            updateAllLobbiesSpy = spyOn<any>(component, 'updateAllLobbiesAttributes');
            updateAllLobbiesSpy.and.callThrough();
        });

        it('should update canJoin attribute of the lobbies (use #1)', () => {
            component.playerName = 'differentName';
            component.playerNameValid = true;
            component['validateName']();
            for (const lobby of component.lobbies) {
                expect(lobby.canJoin).toBeTrue();
            }
        });

        it('should increment numberOfLobbiesMeetingFilter correctly', () => {
            component.filterFormGroup.setValue(CLASSIC_FILTER_VALUES);
            component.numberOfLobbiesMeetingFilter = 0;
            component['validateName']();
            expect(component.numberOfLobbiesMeetingFilter).toEqual(2);
        });

        it('should update canJoin attribute of the lobbies ( use #2)', () => {
            component.playerName = 'Name1';
            component.playerNameValid = true;
            const expected = [false, true, true];
            component['validateName']();
            expect(component.lobbies).toBeTruthy();
            for (let i = 0; i++; i < component.lobbies.length) {
                expect(component.lobbies[i].canJoin).toEqual(expected[i]);
            }
        });

        it('should call setFormAvailability', () => {
            const setFormAvailabilitySpy = spyOn<any>(component, 'setFormAvailability');
            component['validateName']();
            expect(setFormAvailabilitySpy).toHaveBeenCalled();
        });

        it('should call updateAllLobbiesAttributes', () => {
            component['validateName']();
            expect(updateAllLobbiesSpy).toHaveBeenCalled();
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

    describe('updateLobbies', () => {
        it('updateLobbies should call validateName', () => {
            const spy = validateNameSpy.and.returnValue(false);
            component['updateLobbies'](component.lobbies);
            expect(spy).toHaveBeenCalled();
        });

        it('updateLobbies should set lobbies to right value', () => {
            component.lobbies = [
                {
                    lobbyId: 'id',
                    hostName: 'name',
                    gameType: GameType.Classic,
                    gameMode: GameMode.Multiplayer,
                    maxRoundTime: 60,
                    dictionary: TEST_DICTIONARY,
                    canJoin: true,
                },
            ];
            component['updateLobbies']([]);
            expect(component.lobbies).toEqual([]);
        });
    });

    describe('joinRandomLobby', () => {
        let getRandomLobbySpy: jasmine.Spy;
        let joinLobbySpy: jasmine.Spy;
        let snackBarOpenSpy: jasmine.Spy;

        beforeEach(() => {
            getRandomLobbySpy = spyOn<any>(component, 'getRandomLobby');
            joinLobbySpy = spyOn(component, 'joinLobby');
            snackBarOpenSpy = spyOn(component['snackBar'], 'open');
        });

        it('should call getRandomLobby', () => {
            component.joinRandomLobby();
            expect(getRandomLobbySpy).toHaveBeenCalled();
        });

        it('should call joinLobby with lobby id from getRandomLobby', () => {
            const lobby = { lobbyId: 'game-id' };
            getRandomLobbySpy.and.returnValue(lobby);
            component.joinRandomLobby();
            expect(joinLobbySpy).toHaveBeenCalledWith(lobby.lobbyId);
        });

        it('should open snack bar if an error occurs', () => {
            getRandomLobbySpy.and.throwError('Error');
            component.joinRandomLobby();
            expect(snackBarOpenSpy).toHaveBeenCalled();
        });
    });

    describe('getRandomLobby', () => {
        it('should return a lobby randomly from lobbies list', () => {
            (component.lobbies as unknown[]) = [
                { lobbyId: '1', canJoin: true, meetFilters: true },
                { lobbyId: '2', canJoin: true, meetFilters: true },
                { lobbyId: '3', canJoin: true, meetFilters: true },
                { lobbyId: '4', canJoin: true, meetFilters: true },
                { lobbyId: '5', canJoin: true, meetFilters: true },
                { lobbyId: '6', canJoin: true, meetFilters: true },
            ];

            let lobby = component['getRandomLobby']();
            let lastLobby: unknown;
            do {
                lastLobby = lobby;
                lobby = component['getRandomLobby']();
                expect(component.lobbies.includes(lobby)).toBeTrue();
            } while (lastLobby === lobby);

            expect(lastLobby).not.toEqual(lobby); // returns random lobby, not always the same
        });

        it('should throw if no lobby', () => {
            component.lobbies = [];
            expect(() => component['getRandomLobby']()).toThrowError(NO_LOBBY_CAN_BE_JOINED);
        });

        it('should throw if no lobby can be joined', () => {
            component.lobbies = component.lobbies.map((lobby) => ({ ...lobby, canJoin: false }));
            expect(() => component['getRandomLobby']()).toThrowError(NO_LOBBY_CAN_BE_JOINED);
        });

        it('should throw if no lobby fits filters', () => {
            component.lobbies = component.lobbies.map((lobby) => ({ ...lobby, meetFilters: false }));
            expect(() => component['getRandomLobby']()).toThrowError(NO_LOBBY_CAN_BE_JOINED);
        });
    });

    describe('updateAllLobbiesAttributes', () => {
        it('should be called when gameType changes', () => {
            const spy = spyOn<any>(component, 'updateAllLobbiesAttributes').and.callFake(() => {});
            component.filterFormGroup.patchValue({ gameType: 'LOG2990' });
            expect(spy).toHaveBeenCalled();
        });

        it('should update canJoin attribute of the lobbies (use #1)', () => {
            component.playerName = 'differentName';
            component.playerNameValid = true;
            component['updateAllLobbiesAttributes']();
            for (const lobby of component.lobbies) {
                expect(lobby.canJoin).toBeTrue();
            }
        });

        it('should update canJoin attribute of the lobbies ( use #2)', () => {
            component.playerName = 'Name1';
            component.playerNameValid = true;
            const expected = [false, true, true];
            component['updateAllLobbiesAttributes']();
            expect(component.lobbies).toBeTruthy();
            for (let i = 0; i++; i < component.lobbies.length) {
                expect(component.lobbies[i].canJoin).toEqual(expected[i]);
            }
        });
    });

    describe('updateLobbyAttributes', () => {
        let lobby: LobbyInfo;
        let getGameTypeSpy: jasmine.Spy;

        beforeEach(() => {
            lobby = {
                lobbyId: '1',
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
                lobby.meetFilters = undefined;
                lobby.gameType = gameType;
                getGameTypeSpy.and.returnValue({ value: filter } as AbstractControl);
                component['updateLobbyAttributes'](lobby);
                expect<boolean | undefined>(lobby.meetFilters).toEqual(expected);
            }
        });
    });

    it('joinLobby should send to GameDispatcher service to join a lobby', () => {
        const gameDispatcherSpy = spyOn(gameDispatcherServiceMock, 'handleJoinLobby').and.callFake(() => {
            return;
        });
        component.joinLobby(component.lobbies[0].lobbyId);
        expect(gameDispatcherSpy).toHaveBeenCalled();
    });

    it('lobbyFullDialog should open the dialog component', () => {
        const spy = spyOn(component.dialog, 'open');
        component['lobbyFullDialog']();
        expect(spy).toHaveBeenCalled();
    });

    it('lobbyCanceledDialog should open the dialog component', () => {
        const spy = spyOn(component.dialog, 'open');
        component['lobbyCanceledDialog']();
        expect(spy).toHaveBeenCalled();
    });

    it('ngOnInit should subscribe to gameDispatcherService lobbiesUpdateEvent and lobbyFullEvent', () => {
        const spySubscribeLobbyUpdateEvent = spyOn(gameDispatcherServiceMock['lobbiesUpdateEvent'], 'subscribe').and.returnValue(of(true) as any);
        const spySubscribeLobbyFullEvent = spyOn(gameDispatcherServiceMock['lobbyFullEvent'], 'subscribe').and.returnValue(of(true) as any);
        const spySubscribeLobbyCanceledEvent = spyOn(gameDispatcherServiceMock['canceledGameEvent'], 'subscribe').and.returnValue(of(true) as any);
        component.ngOnInit();
        expect(spySubscribeLobbyUpdateEvent).toHaveBeenCalled();
        expect(spySubscribeLobbyCanceledEvent).toHaveBeenCalled();
        expect(spySubscribeLobbyFullEvent).toHaveBeenCalled();
    });

    it('updateLobbies should be called when lobbiesUpdateEvent is emittted', () => {
        const emitLobbies: LobbyInfo[] = [
            {
                lobbyId: '1',
                hostName: 'Name1',
                gameType: GameType.Classic,
                gameMode: GameMode.Multiplayer,
                dictionary: TEST_DICTIONARY,
                maxRoundTime: 60,
                canJoin: false,
            },
        ];
        const spySetOpponent = spyOn<any>(component, 'updateLobbies').and.callFake(() => {
            return;
        });
        gameDispatcherServiceMock['lobbiesUpdateEvent'].next(emitLobbies);
        expect(spySetOpponent).toHaveBeenCalledWith(emitLobbies);
    });

    it('lobbyFullDialog should be called when lobbyFullEvent is emittted', () => {
        const spyLobbyFull = spyOn<any>(component, 'lobbyFullDialog').and.callFake(() => {
            return;
        });
        gameDispatcherServiceMock['lobbyFullEvent'].next();
        expect(spyLobbyFull).toHaveBeenCalled();
    });

    it('lobbyCanceled should be called when lobbyCancelEvent is emittted', () => {
        const spyLobbyCanceled = spyOn<any>(component, 'lobbyCanceledDialog').and.callFake(() => {
            return;
        });
        gameDispatcherServiceMock['canceledGameEvent'].next();
        expect(spyLobbyCanceled).toHaveBeenCalled();
    });
});
