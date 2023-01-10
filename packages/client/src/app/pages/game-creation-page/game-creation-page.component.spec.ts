/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable dot-notation */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatButtonToggleGroupHarness, MatButtonToggleHarness } from '@angular/material/button-toggle/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { VirtualPlayerData, VirtualPlayerProfile } from '@app/classes/admin/virtual-player-profile';
import { DictionarySummary } from '@app/classes/communication/dictionary-summary';
import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
import { IconComponent } from '@app/components/icon/icon.component';
import { NameFieldComponent } from '@app/components/name-field/name-field.component';
import { PageHeaderComponent } from '@app/components/page-header/page-header.component';
import { TileComponent } from '@app/components/tile/tile.component';
import { TimerSelectionComponent } from '@app/components/timer-selection/timer-selection.component';
import { INVALID_DICTIONARY_ID } from '@app/constants/controllers-errors';
import { DEFAULT_PLAYER } from '@app/constants/game-constants';
import { GameMode } from '@app/constants/game-mode';
import { DEFAULT_TIMER_VALUE } from '@app/constants/pages-constants';
import { MOCK_PLAYER_PROFILES, MOCK_PLAYER_PROFILE_MAP } from '@app/constants/service-test-constants';
import { AppMaterialModule } from '@app/modules/material.module';
import { LoadingPageComponent } from '@app/pages/loading-page/loading-page.component';
import { GameDispatcherService } from '@app/services/';
import { DictionaryService } from '@app/services/dictionary-service/dictionary.service';
import { VirtualPlayerProfilesService } from '@app/services/virtual-player-profile-service/virtual-player-profile.service';
import { Subject } from 'rxjs';
import { GameCreationPageComponent } from './game-creation-page.component';
import SpyObj = jasmine.SpyObj;

@Component({
    template: '',
})
class TestComponent {}

describe('GameCreationPageComponent', () => {
    let component: GameCreationPageComponent;
    let fixture: ComponentFixture<GameCreationPageComponent>;
    let loader: HarnessLoader;
    let gameParameters: FormGroup;
    let gameDispatcherServiceSpy: SpyObj<GameDispatcherService>;
    let dictionaryServiceSpy: SpyObj<DictionaryService>;
    let gameDispatcherCreationSubject: Subject<HttpErrorResponse>;
    let dictionaryUpdateSubject: Subject<DictionarySummary[]>;
    let updateObs: Subject<VirtualPlayerProfile[]>;

    const EMPTY_VALUE = '';

    let virtualPlayerProfileSpy: SpyObj<VirtualPlayerProfilesService>;

    beforeEach(() => {
        virtualPlayerProfileSpy = jasmine.createSpyObj('VirtualPlayerProfilesService', [
            'getAllVirtualPlayersProfile',
            'subscribeToVirtualPlayerProfilesUpdateEvent',
            'subscribeToComponentUpdateEvent',
            'subscribeToRequestSentEvent',
            'virtualPlayersUpdateEvent',
        ]);
        virtualPlayerProfileSpy.getAllVirtualPlayersProfile.and.resolveTo();
        updateObs = new Subject();

        virtualPlayerProfileSpy.subscribeToVirtualPlayerProfilesUpdateEvent.and.callFake(
            (serviceDestroyed$: Subject<boolean>, callback: (dictionaries: VirtualPlayerProfile[]) => void) => updateObs.subscribe(callback),
        );
    });

    beforeEach(() => {
        dictionaryServiceSpy = jasmine.createSpyObj('DictionaryService', [
            'getDictionaries',
            'updateAllDictionaries',
            'subscribeToDictionariesUpdateDataEvent',
        ]);
        dictionaryServiceSpy.getDictionaries.and.callFake(() => [{ title: 'Test' } as DictionarySummary]);
        dictionaryServiceSpy.updateAllDictionaries.and.callFake(async () => {});
        dictionaryUpdateSubject = new Subject();
        dictionaryServiceSpy.subscribeToDictionariesUpdateDataEvent.and.callFake(
            (serviceDestroyed$: Subject<boolean>, callback: (dictionaries: DictionarySummary[]) => void) =>
                dictionaryUpdateSubject.subscribe(callback),
        );

        gameDispatcherServiceSpy = jasmine.createSpyObj('GameDispatcherService', ['observeGameCreationFailed', 'handleCreateGame']);
        gameDispatcherCreationSubject = new Subject();
        gameDispatcherServiceSpy.observeGameCreationFailed.and.returnValue(gameDispatcherCreationSubject.asObservable());
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [
                GameCreationPageComponent,
                NameFieldComponent,
                TestComponent,
                TimerSelectionComponent,
                IconComponent,
                PageHeaderComponent,
                LoadingPageComponent,
                TileComponent,
            ],
            imports: [
                AppMaterialModule,
                HttpClientModule,
                BrowserAnimationsModule,
                FormsModule,
                ReactiveFormsModule,
                CommonModule,
                MatButtonToggleModule,
                MatButtonModule,
                MatFormFieldModule,
                MatSelectModule,
                MatCardModule,
                MatInputModule,
                MatProgressSpinnerModule,
                RouterTestingModule.withRoutes([
                    { path: 'waiting-room', component: TestComponent },
                    { path: 'home', component: TestComponent },
                    { path: 'game-creation', component: GameCreationPageComponent },
                    { path: 'game', component: TestComponent },
                ]),
            ],
            providers: [
                MatButtonToggleHarness,
                MatButtonHarness,
                MatButtonToggleGroupHarness,
                GameDispatcherService,
                { provide: GameDispatcherService, useValue: gameDispatcherServiceSpy },
                { provide: DictionaryService, useValue: dictionaryServiceSpy },
                { provide: VirtualPlayerProfilesService, useValue: virtualPlayerProfileSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameCreationPageComponent);
        loader = TestbedHarnessEnvironment.loader(fixture);
        component = fixture.componentInstance;
        gameParameters = component.gameParameters;
        fixture.detectChanges();
    });

    const setValidFormValues = () => {
        const gameParametersForm = component.gameParameters;
        const formValues = {
            gameType: component.gameTypes.LOG2990,
            gameMode: component.gameModes.Solo,
            level: component.virtualPlayerLevels.Beginner,
            virtualPlayerName: DEFAULT_PLAYER.name,
            timer: '60',
            dictionary: 'français',
        };
        gameParametersForm.setValue(formValues);
        component.playerName = 'valid name';
        component['playerNameValid'] = true;
    };

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Subscriptions', () => {
        it('should call handleGameCreationFail when game dispatcher updates game creation failed observable', () => {
            const handleSpy: jasmine.Spy = spyOn<any>(component, 'handleGameCreationFail').and.callFake(() => {});

            const error: HttpErrorResponse = { error: { message: 'test' } } as HttpErrorResponse;
            gameDispatcherCreationSubject.next(error);

            expect(handleSpy).toHaveBeenCalledWith(error);
        });

        it('should update dictionaryOptions when dictionary service updates list', () => {
            const patchValueSpy: jasmine.Spy = spyOn<any>(component['gameParameters'], 'patchValue').and.callFake(() => {});
            dictionaryUpdateSubject.next();
            expect(dictionaryServiceSpy.getDictionaries).toHaveBeenCalled();
            expect(component.dictionaryOptions).toEqual(dictionaryServiceSpy.getDictionaries());
            expect(patchValueSpy).toHaveBeenCalled();
        });

        it('should not update gameParameters if specified', () => {
            const patchValueSpy: jasmine.Spy = spyOn<any>(component['gameParameters'], 'patchValue').and.callFake(() => {});
            component['shouldSetToDefaultDictionary'] = false;
            dictionaryUpdateSubject.next();
            expect(dictionaryServiceSpy.getDictionaries).toHaveBeenCalled();
            expect(patchValueSpy).not.toHaveBeenCalled();
            expect(component.dictionaryOptions).toEqual(dictionaryServiceSpy.getDictionaries());
        });

        it('should patch dictionary value when dictionary service updates list', () => {
            const spy = spyOn(component.gameParameters, 'patchValue').and.callFake(() => {});
            dictionaryUpdateSubject.next();
            expect(spy).toHaveBeenCalledWith({ dictionary: component.dictionaryOptions[0] });
        });
    });

    describe('ngOnInit', () => {
        it('should add validator required to level if game mode is Solo', async () => {
            const spy = spyOn<any>(component.gameParameters.get('level'), 'setValidators');
            await component.ngOnInit();
            component.gameParameters.get('gameMode')?.setValue(GameMode.Solo);
            expect(spy).toHaveBeenCalledWith([Validators.required]);
        });

        it('should remove validator required to level if game mode is not Solo', async () => {
            const spy = spyOn<any>(component.gameParameters.get('level'), 'clearValidators');
            await component.ngOnInit();
            component.gameParameters.get('gameMode')?.setValue(GameMode.Multiplayer);
            expect(spy).toHaveBeenCalled();
        });

        it('should always call updateValueAndValidity to level', async () => {
            const spy = spyOn<any>(component.gameParameters.get('level'), 'updateValueAndValidity');
            await component.ngOnInit();
            component.gameParameters.get('gameMode')?.setValue(undefined);
            expect(spy).toHaveBeenCalled();
        });

        it('should subscribe to gameMode changes', async () => {
            const subscribeSpy = spyOn<any>(component.gameParameters.get('gameMode')?.valueChanges, 'subscribe');
            await component.ngOnInit();
            expect(subscribeSpy).toHaveBeenCalled();
        });

        it('ngOnInit should update dictionary service list', async () => {
            await component.ngOnInit();
            expect(dictionaryServiceSpy.updateAllDictionaries).toHaveBeenCalled();
        });

        it('should subscribe to subscribeToVirtualPlayerProfilesUpdateEvent', async () => {
            await component.ngOnInit();
            expect(virtualPlayerProfileSpy.subscribeToVirtualPlayerProfilesUpdateEvent).toHaveBeenCalled();
        });

        it('subscribeToVirtualPlayerProfilesUpdateEvent should call generateVirtualPlayerProfileMap', async () => {
            const spy = spyOn<any>(component, 'generateVirtualPlayerProfileMap').and.callFake(() => {});
            await component.ngOnInit();
            updateObs.next([]);
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('ngOnDestroy', () => {
        it('should always call next and complete on ngUnsubscribe', () => {
            const ngUnsubscribeNextSpy = spyOn<any>(component['pageDestroyed$'], 'next');
            const ngUnsubscribeCompleteSpy = spyOn<any>(component['pageDestroyed$'], 'complete');

            component.ngOnDestroy();
            expect(ngUnsubscribeNextSpy).toHaveBeenCalled();
            expect(ngUnsubscribeCompleteSpy).toHaveBeenCalled();
        });
    });

    describe('getDefaultTimerValue', () => {
        it('should return the equivalent number', () => {
            spyOn<any>(window['localStorage'], 'getItem').and.returnValue('1');
            expect(component['getDefaultTimerValue']()).toEqual(1);
        });

        it('should return the default value if the stored information is invalid', () => {
            spyOn<any>(window['localStorage'], 'getItem').and.returnValue('a');
            expect(component['getDefaultTimerValue']()).toEqual(DEFAULT_TIMER_VALUE);
        });

        it('should return the default value if there is no stored information', () => {
            spyOn<any>(window['localStorage'], 'getItem').and.returnValue(null);
            expect(component['getDefaultTimerValue']()).toEqual(DEFAULT_TIMER_VALUE);
        });
    });

    describe('isFormValid', () => {
        it('form should be valid if all required fields are filled', () => {
            setValidFormValues();
            expect(component.isFormValid()).toBeTrue();
        });

        it('form should be invalid if gameType is empty', async () => {
            setValidFormValues();
            gameParameters.get('gameType')?.setValue(EMPTY_VALUE);

            expect(component.isFormValid()).toBeFalse();
        });

        it('form should be invalid if gameMode is empty', async () => {
            setValidFormValues();
            gameParameters.get('gameMode')?.setValue(EMPTY_VALUE);

            expect(component.isFormValid()).toBeFalse();
        });

        it('form should be invalid if level is empty while gameMode is solo', async () => {
            setValidFormValues();
            gameParameters.get('level')?.setValue(EMPTY_VALUE);

            expect(component.isFormValid()).toBeFalse();
        });

        it('form should be valid if level is empty while gameMode is multiplayer', async () => {
            setValidFormValues();
            gameParameters.get('gameMode')?.setValue(component.gameModes.Multiplayer);
            gameParameters.get('level')?.setValue(EMPTY_VALUE);

            expect(component.isFormValid()).toBeTrue();
        });

        it('form should not be valid if timer is empty', () => {
            setValidFormValues();
            gameParameters.get('timer')?.setValue(EMPTY_VALUE);

            expect(component.isFormValid()).toBeFalse();
        });

        it('form should not be valid if dictionary is empty', () => {
            setValidFormValues();
            gameParameters.get('dictionary')?.setValue(EMPTY_VALUE);

            expect(component.isFormValid()).toBeFalse();
        });

        it('form should not be valid if name is empty', () => {
            setValidFormValues();

            component.playerName = EMPTY_VALUE;
            component['playerNameValid'] = false;

            expect(component.isFormValid()).toBeFalse();
        });
    });

    describe('onSubmit', () => {
        it('clicking createGame button should call onSubmit', async () => {
            spyOn(component, 'isFormValid').and.returnValue(true);
            fixture.detectChanges();
            const createButton = fixture.debugElement.nativeElement.querySelector('#create-game-button');
            const spy = spyOn(component, 'onSubmit').and.callFake(() => {
                return;
            });
            createButton.click();

            expect(spy).toHaveBeenCalled();
        });

        it('form should call createGame on submit if form is valid', async () => {
            const spy = spyOn<any>(component, 'createGame');
            spyOn(component, 'isFormValid').and.returnValue(true);
            spyOn(component.gameParameters, 'get').and.returnValue({ value: { title: '' } } as any);

            component.onSubmit();
            expect(spy).toHaveBeenCalled();
        });

        it('should NOT call createGame on submit if form is invalid', async () => {
            const spy = spyOn<any>(component, 'createGame');
            spyOn(component, 'isFormValid').and.returnValue(false);

            component.onSubmit();
            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('createGame', () => {
        it('createGame should set isCreatingGame to true', () => {
            component.isCreatingGame = false;
            component['createGame']();
            expect(component.isCreatingGame).toBeTrue();
        });

        it('createGame button should always call gameDispatcher.handleCreateGame', () => {
            component['createGame']();
            expect(gameDispatcherServiceSpy.handleCreateGame).toHaveBeenCalled();
        });
    });

    describe('onPlayerNameChanges', () => {
        it('should set playerName and playerNameCalid', () => {
            component.playerName = EMPTY_VALUE;
            (component['playerNameValid'] as unknown) = EMPTY_VALUE;

            const expectedName = 'player name';
            const expectedValid = true;

            component.onPlayerNameChanges([expectedName, expectedValid]);

            expect(component.playerName).toEqual(expectedName);
            expect(component['playerNameValid']).toEqual(expectedValid);
        });
    });

    it('clicking on Classic button should set gameType attribute to Classic', async () => {
        const gameTypeField = component.gameParameters.get('gameType');
        gameTypeField?.setValue(component.gameTypes.LOG2990);

        const classicButton = await loader.getHarness(
            MatButtonToggleHarness.with({
                selector: '#classic-button',
            }),
        );
        await classicButton.toggle();
        expect(gameTypeField?.value).toEqual(component.gameTypes.Classic);
    });

    it('clicking on Solo button should set gameMode attribute to Solo', async () => {
        const gameModeField = component.gameParameters.get('gameMode');
        gameModeField?.setValue(component.gameModes.Multiplayer);

        const soloButton = await loader.getHarness(
            MatButtonToggleHarness.with({
                selector: '#solo-button',
            }),
        );

        if (await soloButton.isDisabled()) return;
        await soloButton.toggle();
        expect(gameModeField?.value).toEqual(component.gameModes.Solo);
    });

    it('clicking on Multiplayer button should set gameMode attribute to Multiplayer', async () => {
        const gameModeField = component.gameParameters.get('gameMode');
        gameModeField?.setValue(component.gameModes.Solo);

        const multiplayerButton = await loader.getHarness(
            MatButtonToggleHarness.with({
                selector: '#multi-button',
            }),
        );
        await multiplayerButton.toggle();
        expect(gameModeField?.value).toEqual(component.gameModes.Multiplayer);
    });

    it('virtual player level choices should appear if solo mode is selected', async () => {
        const gameModeField = component.gameParameters.get('gameMode');
        gameModeField?.setValue(component.gameModes.Solo);
        fixture.detectChanges();

        const levelLabel = fixture.debugElement.nativeElement.querySelector('#level-label');
        const levelButtons = fixture.debugElement.nativeElement.querySelector('#level-buttons');

        expect(levelLabel).toBeTruthy();
        expect(levelButtons).toBeTruthy();
    });

    it('virtual player level choices should not appear if multiplayer mode is selected', async () => {
        const gameModeField = component.gameParameters.get('gameMode');
        gameModeField?.setValue(component.gameModes.Multiplayer);
        fixture.detectChanges();

        const levelLabel = fixture.debugElement.query(By.css('#level-label'));
        const levelButtons = fixture.debugElement.query(By.css('#level-buttons'));

        expect(levelLabel).toBeFalsy();
        expect(levelButtons).toBeFalsy();
    });

    describe('getVirtualPlayerNames', () => {
        it('should return empty string if no virtual player map', () => {
            component['virtualPlayerNameMap'] = undefined as unknown as Map<VirtualPlayerLevel, string[]>;
            expect(component.getVirtualPlayerNames()).toEqual([]);
        });

        it('should return all names of profiles with Beginner level if this level is selected', () => {
            component['virtualPlayerNameMap'] = MOCK_PLAYER_PROFILE_MAP;

            component.gameParameters.patchValue({ level: VirtualPlayerLevel.Beginner });
            const expectedResult: string[] = MOCK_PLAYER_PROFILES.filter(
                (profile: VirtualPlayerData) => profile.level === VirtualPlayerLevel.Beginner,
            ).map((profile: VirtualPlayerData) => profile.name);

            expect(component.getVirtualPlayerNames()).toEqual(expectedResult);
        });

        it('should return all names of profiles with Expert level if this level is selected', () => {
            component['virtualPlayerNameMap'] = MOCK_PLAYER_PROFILE_MAP;

            component.gameParameters.patchValue({ level: VirtualPlayerLevel.Expert });
            const expectedResult: string[] = MOCK_PLAYER_PROFILES.filter(
                (profile: VirtualPlayerData) => profile.level === VirtualPlayerLevel.Expert,
            ).map((profile: VirtualPlayerData) => profile.name);

            expect(component.getVirtualPlayerNames()).toEqual(expectedResult);
        });
    });

    it('generateVirtualPlayerProfileMap should create virtual player name map', () => {
        component['virtualPlayerNameMap'] = new Map();
        component['generateVirtualPlayerProfileMap'](MOCK_PLAYER_PROFILES);
        expect(component['virtualPlayerNameMap']).toEqual(MOCK_PLAYER_PROFILE_MAP);
    });

    describe('onFormInvalidClick', () => {
        let markSpy: unknown;
        let dictionaryChangeSpy: unknown;
        let nameFieldSpy: unknown;

        beforeEach(() => {
            markSpy = spyOn(component.gameParameters.controls.dictionary, 'markAsTouched').and.callFake(() => {});
            dictionaryChangeSpy = spyOn(component, 'onDictionaryChange').and.callFake(() => {});
            nameFieldSpy = spyOn(component.nameField, 'onFormInvalidClick').and.callFake(() => {});
            component.onFormInvalidClick();
        });

        it('should mark dictionary field as touched so it looks invalid', () => {
            expect(markSpy).toHaveBeenCalled();
        });

        it('should call dictionaryChange method', () => {
            expect(dictionaryChangeSpy).toHaveBeenCalled();
        });

        it('should call onFormInvalidClick on namefield so it updates to look invalid', () => {
            expect(nameFieldSpy).toHaveBeenCalled();
        });
    });

    it('onDictionaryChange should set wasDictionaryDeleted to false', () => {
        component.wasDictionaryDeleted = true;
        component.onDictionaryChange();
        expect(component.wasDictionaryDeleted).toBeFalse();
    });

    describe('handleGameCreationFail', () => {
        let error: HttpErrorResponse;
        let handleDictionaryDeletedSpy: unknown;

        beforeEach(() => {
            handleDictionaryDeletedSpy = spyOn<any>(component, 'handleDictionaryDeleted').and.callFake(() => {});
        });

        it('should call handleDictionaryDeleted if error message is INVALID_DICTIONARY_ID', async () => {
            error = { error: { message: INVALID_DICTIONARY_ID } } as HttpErrorResponse;
            await component['handleGameCreationFail'](error);
            expect(handleDictionaryDeletedSpy).toHaveBeenCalled();
        });

        it('should NOT call handleDictionaryDeleted if error message is INVALID_DICTIONARY_ID', async () => {
            error = { error: { message: 'NOT INVALID DICTIONARY ID' } } as HttpErrorResponse;
            await component['handleGameCreationFail'](error);
            expect(handleDictionaryDeletedSpy).not.toHaveBeenCalled();
        });
    });

    describe('handleDictionaryDeleted', () => {
        let dictionarySetValueSpy: unknown;
        let markSpy: unknown;

        beforeEach(async () => {
            component.wasDictionaryDeleted = false;
            dictionarySetValueSpy = spyOn(component.gameParameters.controls.dictionary, 'setValue').and.callFake(() => {});
            markSpy = spyOn(component.gameParameters.controls.dictionary, 'markAsTouched').and.callFake(() => {});
            await component['handleDictionaryDeleted']();
        });

        it('should set wasDictionaryDeleted to true', () => {
            expect(component.wasDictionaryDeleted).toBeTrue();
        });

        it('should update dictionary in service', () => {
            expect(dictionaryServiceSpy.updateAllDictionaries).toHaveBeenCalled();
        });

        it('should remove selected dictionary', () => {
            expect(dictionarySetValueSpy).toHaveBeenCalledWith(undefined);
        });

        it('should mark dictionary as touched', () => {
            expect(markSpy).toHaveBeenCalled();
        });
    });
});
