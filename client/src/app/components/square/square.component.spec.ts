/* eslint-disable */
import { CommonModule } from '@angular/common';
import { Component, Renderer2 } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SquareView } from '@app/classes/square';
import { COLORS } from '@app/constants/colors';
import { SQUARE_SIZE, UNDEFINED_SQUARE, UNDEFINED_SQUARE_SIZE, UNDEFINED_TILE } from '@app/constants/game';
import { AppMaterialModule } from '@app/modules/material.module';
import { CssStyleProperty, SquareComponent } from './square.component';
import SpyObj = jasmine.SpyObj;

const fakeStyleFunc = (el: HTMLElement, styleKey: string, styleValue: string): void => {
    el.style.setProperty(styleKey, styleValue);
};

describe('SquareComponent', () => {
    let rendererSpy: SpyObj<Renderer2>;
    let component: SquareComponent;
    let fixture: ComponentFixture<CenterSquareWrapperComponent>;

    beforeEach(async () => {
        rendererSpy = jasmine.createSpyObj('Renderer2', ['setStyle']);
        rendererSpy.setStyle.and.callFake(fakeStyleFunc);
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                MatGridListModule,
                MatCardModule,
                MatProgressSpinnerModule,
                MatIconModule,
                MatButtonModule,
                ReactiveFormsModule,
                CommonModule,
                MatInputModule,
                BrowserAnimationsModule,
                AppMaterialModule,
                MatFormFieldModule,
                FormsModule,
                MatDialogModule,
            ],
            declarations: [SquareComponent, CenterSquareWrapperComponent],
            providers: [Renderer2],
        }).compileComponents();
    });

    it('should create', () => {
        fixture = TestBed.createComponent(CenterSquareWrapperComponent);
        component = fixture.debugElement.children[0].componentInstance;
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('ngOnInit should call initializeStyle()', () => {
        const squareWrapper = new SquareTestWrapper();
        squareWrapper.createComponent(rendererSpy);

        spyOn<any>(squareWrapper.squareComponent, 'initializeStyle').and.callFake(() => {
            return;
        });

        squareWrapper.squareComponent.ngOnInit();
        expect(squareWrapper.squareComponent['initializeStyle']).toHaveBeenCalled();
    });

    it('ngAfterViewInit should call createStar()', () => {
        const squareWrapper = new SquareTestWrapper();
        squareWrapper.createComponent(rendererSpy);

        spyOn<any>(squareWrapper.squareComponent, 'createStar').and.callFake(() => {
            return;
        });

        squareWrapper.squareComponent.ngAfterViewInit();
        expect(squareWrapper.squareComponent['createStar']).toHaveBeenCalled();
    });

    it('getSquareSize should return UNDEFINED_SQUARE_SIZE if no SquareView is attached', () => {
        const squareWrapper = new SquareTestWrapper();
        spyOnProperty<any>(squareWrapper, 'squareView', 'get').and.returnValue(null);
        squareWrapper.createComponent(rendererSpy);

        expect(squareWrapper.squareComponent.getSquareSize()).toEqual(UNDEFINED_SQUARE_SIZE);
    });

    it('getSquareSize should return square_size if SquareView is attached', () => {
        const squareWrapper = new SquareTestWrapper();
        squareWrapper.createComponent(rendererSpy);

        expect(squareWrapper.squareComponent.getSquareSize()).toEqual(squareWrapper.squareView.squareSize);
    });

    it('getText should return UNDEFINED_TILE.letter if no SquareView is attached', () => {
        const squareWrapper = new SquareTestWrapper();
        spyOnProperty<any>(squareWrapper, 'squareView', 'get').and.returnValue(null);
        squareWrapper.createComponent(rendererSpy);

        expect(squareWrapper.squareComponent.getText()).toBe(UNDEFINED_TILE.letter);
    });

    it('getText should call squareView.getText()', () => {
        const testText = 'Test';
        const squareWrapper = new SquareTestWrapper();
        squareWrapper.createComponent(rendererSpy);
        const getTextSpy = spyOn(squareWrapper.squareComponent, 'getText').and.callFake(() => {
            return testText;
        });
        expect(squareWrapper.squareComponent.getText()).toEqual(testText);
        expect(getTextSpy).toHaveBeenCalled();
    });

    it('getText should return value of squareView.getText()', () => {
        const squareWrapper = new SquareTestWrapper();
        squareWrapper.createComponent(rendererSpy);
        expect(squareWrapper.squareComponent.getText()).toEqual(squareWrapper.squareView.getText());
    });

    it('initializeStyle should set background-color', () => {
        const squareWrapper = new SquareTestWrapper();
        squareWrapper.createComponent(rendererSpy);
        const expectedColor = COLORS.Blue;

        spyOn(squareWrapper.squareComponent.squareView, 'getColor').and.returnValue(expectedColor);
        squareWrapper.squareComponent['initializeStyle']();

        const actualColor = squareWrapper.squareComponent.style['background-color'];
        expect(actualColor).toEqual(expectedColor);
    });

    it('createStar should not do anything if square is not the center', () => {
        const squareWrapper = new SquareTestWrapper();
        squareWrapper.createComponent(rendererSpy);
        squareWrapper.squareComponent.squareView.square.isCenter = false;

        spyOn<any>(squareWrapper.squareComponent, 'applyStarStyleAndClasses').and.callFake(() => {
            return;
        });
        squareWrapper.squareComponent['createStar']();
        expect(squareWrapper.squareComponent['applyStarStyleAndClasses']).not.toHaveBeenCalled();
    });

    it('createStar should create HTML elements if square is the center', async () => {
        fixture = TestBed.createComponent(CenterSquareWrapperComponent);
        component = fixture.debugElement.children[0].componentInstance;
        fixture.detectChanges();

        const buttonWrapper = fixture.debugElement.query(By.css('.mat-button-wrapper')).nativeElement;
        const initialDivAmount = buttonWrapper.getElementsByTagName('div').length;
        const initialIAmount = buttonWrapper.getElementsByTagName('i').length;

        spyOn<any>(component, 'applyStarStyleAndClasses').and.callFake(() => {
            return;
        });

        component['createStar']();
        const actualDivAmount = buttonWrapper.getElementsByTagName('div').length;
        const actualIAmount = buttonWrapper.getElementsByTagName('i').length;

        const expectedDivAmount = initialDivAmount + 1;
        const expectedIAmount = initialIAmount + 1;

        expect(actualDivAmount).toEqual(expectedDivAmount);
        expect(actualIAmount).toEqual(expectedIAmount);
    });

    it('applyStarStyleAndClasses should call the renderer setStyle method', async () => {
        const squareWrapper = new SquareTestWrapper();
        squareWrapper.createComponent(rendererSpy);
        squareWrapper.squareComponent.squareView.square.isCenter = true;

        // Creating the HTMLElements to pass to the Renderer
        // to call applyStarStyleAndClasses() right now

        const addedDiv = document.createElement('div');
        const addedI = document.createElement('i');

        squareWrapper.squareComponent['applyStarStyleAndClasses'](addedDiv, addedI);

        // Getting the expected styles that should have been applied
        const expectedDivStyle = SquareComponent['starDivStyle'];
        const expectedStarStyle = SquareComponent['starStyle'];

        // Verify the setStyle method was called with the right styles
        expectedDivStyle.forEach((cssStyle: CssStyleProperty) => {
            expect(rendererSpy.setStyle).toHaveBeenCalledWith(addedDiv, cssStyle.key, cssStyle.value);
        });

        expectedStarStyle.forEach((cssStyle: CssStyleProperty) => {
            expect(rendererSpy.setStyle).toHaveBeenCalledWith(addedI, cssStyle.key, cssStyle.value);
        });
    });

    it('applyStarStyleAndClasses should call set the styles and classes for the HTMLElements', async () => {
        const squareWrapper = new SquareTestWrapper();
        squareWrapper.createComponent(rendererSpy);
        squareWrapper.squareComponent.squareView.square.isCenter = true;

        // Creating the HTMLElements to pass to the Renderer
        // to call applyStarStyleAndClasses() right now

        const addedDiv = document.createElement('div');
        const addedI = document.createElement('i');

        // eslint-disable-next-line dot-notation
        squareWrapper.squareComponent['applyStarStyleAndClasses'](addedDiv, addedI);

        // Getting the expected styles that should have been applied
        const expectedDivStyle = SquareComponent['starDivStyle'];
        const expectedStarStyle = SquareComponent['starStyle'];
        const expectedStarClasses = SquareComponent['starElementClasses'];

        // Verify the setStyle method was called with the right styles
        expectedDivStyle.forEach((cssStyle: CssStyleProperty) => {
            expect(addedDiv.style.getPropertyValue(cssStyle.key)).toEqual(cssStyle.value);
        });

        expectedStarStyle.forEach((cssStyle: CssStyleProperty) => {
            expect(addedI.style.getPropertyValue(cssStyle.key)).toEqual(cssStyle.value);
        });

        expectedStarClasses.forEach((c) => {
            expect(addedI.classList).toContain(c);
        });
    });
});

export class SquareTestWrapper {
    pSquareView: SquareView;
    squareComponent: SquareComponent;

    createComponent(renderer: Renderer2) {
        this.squareView = new SquareView(UNDEFINED_SQUARE, UNDEFINED_SQUARE_SIZE);
        this.squareComponent = new SquareComponent(renderer);
        this.squareComponent.squareView = this.squareView;
    }
    get squareView(): SquareView {
        return this.pSquareView;
    }

    set squareView(squareView: SquareView) {
        this.pSquareView = squareView;
    }
}

@Component({
    selector: 'app-square-component-wrapper',
    template: '<app-square [squareView]="squareView"></app-square>',
})
class CenterSquareWrapperComponent {
    squareView = new SquareView(
        {
            tile: null,
            multiplier: null,
            wasMultiplierUsed: false,
            isCenter: true,
        },
        SQUARE_SIZE,
    );
}
