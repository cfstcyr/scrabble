/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IconComponent } from '@app/components/icon/icon.component';

import { MatTooltipModule } from '@angular/material/tooltip';
import { GroupRequestWaitingDialogComponent } from './group-request-waiting-dialog';

describe('RequestingUserContainerComponent', () => {
    let component: GroupRequestWaitingDialogComponent;
    let fixture: ComponentFixture<GroupRequestWaitingDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GroupRequestWaitingDialogComponent, IconComponent],
            imports: [MatTooltipModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GroupRequestWaitingDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
