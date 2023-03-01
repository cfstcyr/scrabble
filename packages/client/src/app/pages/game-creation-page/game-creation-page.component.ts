import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
import { GameDispatcherService } from '@app/services';
import { gameSettings } from '@app/utils/settings';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-game-creation-page',
    templateUrl: './game-creation-page.component.html',
    styleUrls: ['./game-creation-page.component.scss'],
})
export class GameCreationPageComponent implements OnDestroy {
    virtualPlayerLevels: typeof VirtualPlayerLevel;
    playerName: string;
    gameParameters: FormGroup;

    isCreatingGame: boolean;

    private pageDestroyed$: Subject<boolean>;

    constructor(private gameDispatcherService: GameDispatcherService) {
        this.virtualPlayerLevels = VirtualPlayerLevel;
        this.pageDestroyed$ = new Subject();
        this.gameParameters = new FormGroup({
            level: new FormControl(VirtualPlayerLevel.Beginner),
            timer: new FormControl(gameSettings.getTimer(), Validators.required),
        });

        this.isCreatingGame = false;

        this.gameDispatcherService.observeGameCreationFailed().pipe(takeUntil(this.pageDestroyed$));
    }

    ngOnDestroy(): void {
        this.pageDestroyed$.next(true);
        this.pageDestroyed$.complete();
    }

    isFormValid(): boolean {
        return this.gameParameters?.valid;
    }

    onSubmit(): void {
        if (this.isFormValid()) {
            gameSettings.set('playerName', this.playerName);
            gameSettings.set('timer', this.gameParameters.get('timer')?.value);
            this.createGame();
        }
    }

    private createGame(): void {
        this.isCreatingGame = true;
        this.gameDispatcherService.handleCreateGame(this.gameParameters);
    }
}
