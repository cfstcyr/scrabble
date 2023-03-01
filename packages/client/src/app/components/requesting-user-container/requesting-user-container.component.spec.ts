/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IconComponent } from '@app/components/icon/icon.component';

import { RequestingUserContainerComponent } from './requesting-user-container.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpClientModule } from '@angular/common/http';

describe('RequestingUserContainerComponent', () => {
    let component: RequestingUserContainerComponent;
    let fixture: ComponentFixture<RequestingUserContainerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [RequestingUserContainerComponent, IconComponent],
            imports: [HttpClientModule, MatTooltipModule, HttpClientTestingModule, RouterTestingModule.withRoutes([])],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(RequestingUserContainerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
