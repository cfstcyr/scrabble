import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { VirtualPlayerProfile } from '@app/classes/admin/virtual-player-profile';
import { DictionarySummary } from '@app/classes/communication/dictionary-summary';
import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
import { NameFieldComponent } from '@app/components/name-field/name-field.component';
import { DICTIONARY_DELETED, DICTIONARY_REQUIRED } from '@app/constants/component-errors';
import { INVALID_DICTIONARY_ID } from '@app/constants/controllers-errors';
import { GameMode } from '@app/constants/game-mode';
import { GameType } from '@app/constants/game-type';
import { DEFAULT_TIMER_VALUE } from '@app/constants/pages-constants';
import { DICTIONARY_NAME_KEY, PLAYER_NAME_KEY, TIMER_KEY } from '@app/constants/session-storage-constants';
import { GameDispatcherService } from '@app/services';
import { DictionaryService } from '@app/services/dictionary-service/dictionary.service';
import { VirtualPlayerProfilesService } from '@app/services/virtual-player-profile-service/virtual-player-profile.service';
import { randomizeArray } from '@app/utils/randomize-array/randomize-array';
import { Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-game-creation-page',
    templateUrl: './game-creation-page.component.html',
    styleUrls: ['./game-creation-page.component.scss'],
})
export class GameCreationPageComponent implements OnInit, OnDestroy {
    @ViewChild(NameFieldComponent) nameField: NameFieldComponent;

    gameTypes: typeof GameType;
    gameModes: typeof GameMode;
    virtualPlayerLevels: typeof VirtualPlayerLevel;
    dictionaryOptions: DictionarySummary[];
    playerName: string;
    gameParameters: FormGroup;

    dictionaryRequiredError: string;
    dictionaryDeletedError: string;
    wasDictionaryDeleted: boolean;

    isCreatingGame: boolean;

    private playerNameValid: boolean;
    private shouldSetToDefaultDictionary: boolean;
    private virtualPlayerNameMap: Map<VirtualPlayerLevel, string[]>;
    private pageDestroyed$: Subject<boolean>;

    constructor(
        private gameDispatcherService: GameDispatcherService,
        private readonly virtualPlayerProfilesService: VirtualPlayerProfilesService,
        private readonly dictionaryService: DictionaryService,
    ) {
        this.gameTypes = GameType;
        this.gameModes = GameMode;
        this.virtualPlayerLevels = VirtualPlayerLevel;
        this.dictionaryOptions = [];
        this.virtualPlayerNameMap = new Map();
        this.playerName = window.localStorage.getItem(PLAYER_NAME_KEY) || '';
        this.playerNameValid = false;
        this.pageDestroyed$ = new Subject();
        this.gameParameters = new FormGroup({
            gameType: new FormControl(GameType.Classic, Validators.required),
            gameMode: new FormControl(GameMode.Multiplayer, Validators.required),
            level: new FormControl(VirtualPlayerLevel.Beginner),
            virtualPlayerName: new FormControl(''),
            timer: new FormControl(this.getDefaultTimerValue(), Validators.required),
            dictionary: new FormControl(undefined, [Validators.required]),
        });

        this.dictionaryRequiredError = DICTIONARY_REQUIRED;
        this.dictionaryDeletedError = DICTIONARY_DELETED;
        this.wasDictionaryDeleted = false;

        this.isCreatingGame = false;

        this.shouldSetToDefaultDictionary = true;

        this.gameDispatcherService
            .observeGameCreationFailed()
            .pipe(takeUntil(this.pageDestroyed$))
            .subscribe(async (error: HttpErrorResponse) => await this.handleGameCreationFail(error));

        this.dictionaryService.subscribeToDictionariesUpdateDataEvent(this.pageDestroyed$, () => {
            this.dictionaryOptions = this.dictionaryService.getDictionaries();
            if (this.shouldSetToDefaultDictionary)
                this.gameParameters.patchValue({
                    dictionary:
                        this.dictionaryOptions.find((d) => d.title === window.localStorage.getItem(DICTIONARY_NAME_KEY)) || this.dictionaryOptions[0],
                });
        });
    }

    async ngOnInit(): Promise<void> {
        this.gameParameters
            .get('gameMode')
            ?.valueChanges.pipe(takeUntil(this.pageDestroyed$), distinctUntilChanged())
            .subscribe((value) => {
                if (value === this.gameModes.Solo) {
                    this.gameParameters?.get('level')?.setValidators([Validators.required]);
                    this.gameParameters?.get('virtualPlayerName')?.setValidators([Validators.required]);
                } else {
                    this.gameParameters?.get('level')?.clearValidators();
                    this.gameParameters?.get('virtualPlayerName')?.clearValidators();
                }
                this.gameParameters?.get('level')?.updateValueAndValidity();
                this.gameParameters?.get('virtualPlayerName')?.updateValueAndValidity();
                this.gameParameters.patchValue({ virtualPlayerName: randomizeArray(this.getVirtualPlayerNames())[0] });
            });

        await this.dictionaryService.updateAllDictionaries();

        this.gameParameters
            .get('level')
            ?.valueChanges.pipe(takeUntil(this.pageDestroyed$), distinctUntilChanged())
            .subscribe(() => this.gameParameters.patchValue({ virtualPlayerName: randomizeArray(this.getVirtualPlayerNames())[0] }));

        this.virtualPlayerProfilesService.subscribeToVirtualPlayerProfilesUpdateEvent(this.pageDestroyed$, (profiles) => {
            this.generateVirtualPlayerProfileMap(profiles);
        });
        this.virtualPlayerProfilesService.getAllVirtualPlayersProfile();
    }

    ngOnDestroy(): void {
        this.pageDestroyed$.next(true);
        this.pageDestroyed$.complete();
    }

    isFormValid(): boolean {
        return this.gameParameters?.valid && this.playerNameValid;
    }

    onSubmit(): void {
        if (this.isFormValid()) {
            window.localStorage.setItem(PLAYER_NAME_KEY, this.playerName);
            window.localStorage.setItem(DICTIONARY_NAME_KEY, this.gameParameters.get('dictionary')?.value.title);
            window.localStorage.setItem(TIMER_KEY, this.gameParameters.get('timer')?.value);
            this.createGame();
        }
    }

    onPlayerNameChanges([playerName, valid]: [string, boolean]): void {
        this.playerName = playerName;
        this.playerNameValid = valid;
    }

    onFormInvalidClick(): void {
        this.gameParameters.controls.dictionary?.markAsTouched();
        this.onDictionaryChange();
        this.nameField.onFormInvalidClick();
    }

    onDictionaryChange(): void {
        this.wasDictionaryDeleted = false;
    }

    getVirtualPlayerNames(): string[] {
        if (!this.virtualPlayerNameMap) return [];
        const namesForLevel: string[] | undefined = this.virtualPlayerNameMap.get(this.gameParameters.get('level')?.value);
        return namesForLevel ?? [];
    }

    private generateVirtualPlayerProfileMap(virtualPlayerProfiles: VirtualPlayerProfile[]): void {
        virtualPlayerProfiles.forEach((profile: VirtualPlayerProfile) => {
            const namesForLevel: string[] | undefined = this.virtualPlayerNameMap.get(profile.level);
            if (!namesForLevel) this.virtualPlayerNameMap.set(profile.level, [profile.name]);
            else namesForLevel.push(profile.name);
        });
    }

    private getDefaultTimerValue(): number {
        const INVALID = -1;
        const time = Number.parseInt(window.localStorage.getItem(TIMER_KEY) || `${INVALID}`, 10);
        return !Number.isNaN(time) && time > INVALID ? time : DEFAULT_TIMER_VALUE;
    }

    private createGame(): void {
        this.isCreatingGame = true;
        this.gameDispatcherService.handleCreateGame(this.playerName, this.gameParameters);
    }

    private async handleGameCreationFail(error: HttpErrorResponse): Promise<void> {
        if (error.error.message === INVALID_DICTIONARY_ID) {
            await this.handleDictionaryDeleted();
        }
    }

    private async handleDictionaryDeleted(): Promise<void> {
        this.wasDictionaryDeleted = true;
        this.shouldSetToDefaultDictionary = false;
        await this.dictionaryService.updateAllDictionaries();
        this.gameParameters.controls.dictionary?.setValue(undefined);
        this.gameParameters.controls.dictionary?.markAsTouched();
        this.isCreatingGame = false;
    }
}
