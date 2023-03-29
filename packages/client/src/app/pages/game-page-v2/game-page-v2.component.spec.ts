import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GamePageV2Component } from './game-page-v2.component';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('GamePageV2Component', () => {
    let component: GamePageV2Component;
    let fixture: ComponentFixture<GamePageV2Component>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GamePageV2Component],
            imports: [MatDialogModule, RouterTestingModule, HttpClientTestingModule, MatSnackBarModule],
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
