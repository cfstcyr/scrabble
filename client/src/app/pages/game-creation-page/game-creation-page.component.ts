import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DictionarySummary } from '@app/classes/communication/dictionary-summary';
import { GameMode } from '@app/classes/game-mode';
import { GameType } from '@app/classes/game-type';
import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
import { NameFieldComponent } from '@app/components/name-field/name-field.component';
import { DICTIONARY_DELETED, DICTIONARY_REQUIRED } from '@app/constants/component-errors';
import { INVALID_DICTIONARY_ID } from '@app/constants/controllers-errors';
import { DEFAULT_TIMER_VALUE } from '@app/constants/pages-constants';
import { GameDispatcherService } from '@app/services';
import { DictionaryService } from '@app/services/dictionary-service/dictionary.service';
import { randomizeArray } from '@app/utils/randomize-array';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
    virtualPlayerNames: string[];
    playerName: string;
    playerNameValid: boolean;
    pageDestroyed$: Subject<boolean>;
    gameParameters: FormGroup;

    dictionaryRequiredError: string;
    dictionaryDeletedError: string;
    wasDictionaryDeleted: boolean;

    isCreatingGame: boolean;

    constructor(private gameDispatcherService: GameDispatcherService, private readonly dictionaryService: DictionaryService) {
        this.gameTypes = GameType;
        this.gameModes = GameMode;
        this.virtualPlayerLevels = VirtualPlayerLevel;
        this.dictionaryOptions = [];
        this.virtualPlayerNames = randomizeArray(['Victoria', 'Aristote', 'Herménégilde']);
        this.playerName = '';
        this.playerNameValid = false;
        this.pageDestroyed$ = new Subject();
        this.gameParameters = new FormGroup({
            gameType: new FormControl(GameType.Classic, Validators.required),
            gameMode: new FormControl(GameMode.Multiplayer, Validators.required),
            level: new FormControl(VirtualPlayerLevel.Beginner, Validators.required),
            virtualPlayerName: new FormControl(this.virtualPlayerNames[0], Validators.required),
            timer: new FormControl(DEFAULT_TIMER_VALUE, Validators.required),
            dictionary: new FormControl(undefined, [Validators.required]),
        });

        this.dictionaryRequiredError = DICTIONARY_REQUIRED;
        this.dictionaryDeletedError = DICTIONARY_DELETED;
        this.wasDictionaryDeleted = false;

        this.isCreatingGame = false;

        this.gameDispatcherService
            .observeGameCreationFailed()
            .pipe(takeUntil(this.pageDestroyed$))
            .subscribe(async (error: HttpErrorResponse) => await this.handleGameCreationFail(error));
        this.dictionaryService.subscribeToDictionariesUpdateDataEvent(this.pageDestroyed$, () => {
            this.dictionaryOptions = this.dictionaryService.getDictionaries();
        });
    }

    async ngOnInit(): Promise<void> {
        this.gameParameters
            .get('gameMode')
            ?.valueChanges.pipe(takeUntil(this.pageDestroyed$))
            .subscribe((value) => {
                if (value === this.gameModes.Solo) {
                    this.gameParameters?.get('level')?.setValidators([Validators.required]);
                } else {
                    this.gameParameters?.get('level')?.clearValidators();
                }
                this.gameParameters?.get('level')?.updateValueAndValidity();
            });
        await this.dictionaryService.updateAllDictionaries();
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
        await this.dictionaryService.updateAllDictionaries();
        this.gameParameters.controls.dictionary?.setValue(undefined);
        this.gameParameters.controls.dictionary?.markAsTouched();
        this.isCreatingGame = false;
    }
}
