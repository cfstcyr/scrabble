import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EndGameDialogParameters } from './end-game-dialog.types';
import { DIALOG_END_OF_GAME_TITLE } from '@app/constants/pages-constants';
import { ROUTE_HOME } from '@app/constants/routes-constants';
import { Router } from '@angular/router';

@Component({
    selector: 'app-end-game-dialog',
    templateUrl: 'end-game-dialog.html',
    styleUrls: ['end-game-dialog.scss'],
})
export class EndGameDialogComponent {
    title: string;
    hasWon: boolean;
    message: string;
    // ratingMessage: string;
    adjustedRating: number;
    ratingVariation: number;
    action?: () => void;
    constructor(@Inject(MAT_DIALOG_DATA) public data: EndGameDialogParameters, private router: Router) {
        this.hasWon = data.hasWon;
        this.title = DIALOG_END_OF_GAME_TITLE(this.hasWon);
        this.message = this.hasWon ? 'Bravo pour votre victoire!' : 'Meilleure chance la prochaine fois!';
        this.ratingVariation = data.ratingVariation;
        this.adjustedRating = data.adjustedRating;
        this.action = data.action;
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        // this.ratingMessage = `Votre nouveau classement Elo est de ${Math.round(data.adjustedRating ?? 1000)} (${
        //     Math.round(data.ratingVariation ?? 0) >= 0 ? '+' : ''
        // }${Math.round(data.ratingVariation ?? 0)}).`;
    }

    handleButtonClick() {
        if (this.action) this.action();
        this.router.navigate([ROUTE_HOME]);
    }
}
