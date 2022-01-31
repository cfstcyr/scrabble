import { AfterViewInit, Component, ElementRef, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { SquareView } from '@app/classes/square';
import { Vec2 } from '@app/classes/vec2';
import { UNDEFINED_SQUARE_SIZE, UNDEFINED_TILE } from '@app/constants/game';

export interface CssStyle {
    key: string;
    value: string;
}

@Component({
    selector: 'app-square',
    templateUrl: './square.component.html',
    styleUrls: ['./square.component.scss'],
})
export class SquareComponent implements OnInit, AfterViewInit {
    private static readonly starElementClasses: string[] = ['fa', 'fa-solid', 'fa-star'];
    private static readonly starStyle: CssStyle[] = [{ key: 'font-size', value: '40px' }];
    private static readonly starDivStyle: CssStyle[] = [
        { key: 'display', value: 'flex' },
        { key: 'align-items', value: 'center' },
        { key: 'justify-content', value: 'center' },
    ];

    @Input() squareView: SquareView;
    @ViewChild('squareButton', { static: false, read: ElementRef }) button: ElementRef<HTMLButtonElement>;
    style: { [key: string]: string } = {};

    constructor(private renderer: Renderer2) {}
    ngOnInit() {
        this.initializeStyle();
    }

    ngAfterViewInit() {
        this.createStar();
    }

    getSquareSize(): Vec2 {
        if (!this.squareView) {
            return UNDEFINED_SQUARE_SIZE;
        }
        return this.squareView.squareSize;
    }

    getText(): string {
        if (!this.squareView) {
            return UNDEFINED_TILE.letter;
        }
        return this.squareView.getText();
    }

    private initializeStyle() {
        this.style = {
            'background-color': this.squareView.getColor(),
        };
    }

    private createStar() {
        if (!this.squareView.square.isCenter) return;
        /*
            We need to apply the classes and style dynamically because
            the mat-button creates the span for the button's text dynamically.
        */
        const textWrapper = this.button.nativeElement.getElementsByClassName('mat-button-wrapper')[0];
        const starDiv = this.renderer.createElement('div');
        const starElement = this.renderer.createElement('i');

        this.applyStarStyleAndClasses(starDiv, starElement);

        starDiv.appendChild(starElement);
        textWrapper.appendChild(starDiv);
    }

    private applyStarStyleAndClasses(starDiv: HTMLElement, starElement: HTMLElement) {
        SquareComponent.starDivStyle.forEach((style: CssStyle) => {
            // eslint-disable-next-line no-console
            console.log('apply');
            this.renderer.setStyle(starDiv, style.key, style.value);
        });
        SquareComponent.starStyle.forEach((style: CssStyle) => this.renderer.setStyle(starElement, style.key, style.value));
        SquareComponent.starElementClasses.forEach((c) => starElement.classList.add(c));
    }
}
