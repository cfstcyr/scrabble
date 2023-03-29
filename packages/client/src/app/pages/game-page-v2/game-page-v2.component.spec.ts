import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GamePageV2Component } from './game-page-v2.component';

describe('GamePageV2Component', () => {
    let component: GamePageV2Component;
    let fixture: ComponentFixture<GamePageV2Component>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GamePageV2Component],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GamePageV2Component);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
