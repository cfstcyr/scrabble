/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IconComponent } from '@app/components/icon/icon.component';

import { JoinerListContainerComponent } from './joiner-list-container.component';
import { MatTooltipModule } from '@angular/material/tooltip';

describe('JoinerListContainerComponent', () => {
    let component: JoinerListContainerComponent;
    let fixture: ComponentFixture<JoinerListContainerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [JoinerListContainerComponent, IconComponent],
            imports: [MatTooltipModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(JoinerListContainerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
