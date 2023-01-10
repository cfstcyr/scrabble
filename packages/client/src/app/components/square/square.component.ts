import { Component, Input, OnInit } from '@angular/core';
import { Orientation } from '@app/classes/actions/orientation';
import { SquareView } from '@app/classes/square';
import { DEFAULT_SQUARE_VIEW } from '@app/constants/game-constants';
import { SQUARE_TILE_DEFAULT_FONT_SIZE } from '@app/constants/tile-font-size-constants';

export interface CssStyleProperty {
    key: string;
    value: string;
}

@Component({
    selector: 'app-square',
    templateUrl: './square.component.html',
    styleUrls: ['./square.component.scss'],
})
export class SquareComponent implements OnInit {
    @Input() squareView: SquareView = DEFAULT_SQUARE_VIEW;
    @Input() tileFontSize: number = SQUARE_TILE_DEFAULT_FONT_SIZE;
    @Input() isCursor: boolean = false;
    @Input() cursorOrientation: Orientation = Orientation.Horizontal;
    multiplierType: string | undefined = undefined;
    multiplierValue: string | undefined = undefined;

    ngOnInit(): void {
        [this.multiplierType, this.multiplierValue] = this.squareView.getText();
    }

    getOrientationClass(): string {
        return `cursor-${this.cursorOrientation === Orientation.Horizontal ? 'horizontal' : 'vertical'}`;
    }
}
