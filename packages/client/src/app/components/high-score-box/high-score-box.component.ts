import { Component, Input } from '@angular/core';
import { SingleHighScore } from '@app/classes/admin/high-score';
import { DEFAULT_HIGH_SCORE } from '@app/constants/components-constants';

@Component({
    selector: 'app-high-score-box',
    templateUrl: './high-score-box.component.html',
    styleUrls: ['./high-score-box.component.scss'],
})
export class HighScoreBoxComponent {
    @Input() highScore: SingleHighScore = DEFAULT_HIGH_SCORE;
}
