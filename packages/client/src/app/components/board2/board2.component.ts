import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SquareView } from '@app/classes/square';
import { LETTER_VALUES } from '@app/constants/game-constants';
import { Observable, of } from 'rxjs';

@Component({
    selector: 'app-board2',
    templateUrl: './board2.component.html',
    styleUrls: ['./board2.component.scss'],
})
export class Board2Component {
    @Input() isObserver: boolean = false;
    @Input() grid: Observable<SquareView[][]>;
    @Input() canInteract: Observable<boolean> = of(true);
    @Output() clearNewlyPlacedTiles: EventEmitter<void> = new EventEmitter();
    letters = LETTER_VALUES;

    onBoardClick() {
        this.clearNewlyPlacedTiles.next();
    }
}
