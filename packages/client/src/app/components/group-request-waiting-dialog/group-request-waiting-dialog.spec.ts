/* eslint-disable max-classes-per-file */
// /* eslint-disable dot-notation */
// /* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { IconComponent } from '@app/components/icon/icon.component';
import { PageHeaderComponent } from '@app/components/page-header/page-header.component';
import { AppMaterialModule } from '@app/modules/material.module';
import { GroupsPageComponent } from '@app/pages/groups-page/groups-page.component';
import { GameVisibility } from '@common/models/game-visibility';
import { Group } from '@common/models/group';
import { VirtualPlayerLevel } from '@common/models/virtual-player-level';
import { Subject } from 'rxjs';
import { GroupRequestWaitingDialogComponent } from './group-request-waiting-dialog';

const USER1 = { username: 'user1', email: 'email1', avatar: 'avatar1' };
const TEST_GROUP: Group = {
    maxRoundTime: 1,
    groupId: 'idgroup',
    user1: USER1,
    virtualPlayerLevel: VirtualPlayerLevel.Beginner,
    gameVisibility: GameVisibility.Private,
    password: '',
};

@Component({
    template: '',
})
export class TestComponent {}

export class MatDialogMock {
    confirmationObservable: Subject<void> = new Subject<void>();
    close() {
        return {
            close: () => ({}),
        };
    }
    // confirmationSpy = spyOn(service['gameDispatcherController'], 'handleStartGame').and.returnValue(confirmationObservable);
    backdropClick() {
        return this.confirmationObservable.asObservable();
    }
}

describe('GroupRequestWaitingDialogComponent', () => {
    let component: GroupRequestWaitingDialogComponent;
    let fixture: ComponentFixture<GroupRequestWaitingDialogComponent>;
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GroupRequestWaitingDialogComponent, IconComponent, PageHeaderComponent],
            imports: [
                AppMaterialModule,
                HttpClientModule,
                MatFormFieldModule,
                ReactiveFormsModule,
                MatSelectModule,
                MatDividerModule,
                MatProgressSpinnerModule,
                MatDialogModule,
                MatSnackBarModule,
                BrowserAnimationsModule,
                MatCardModule,
                MatTabsModule,
                HttpClientModule,
                HttpClientTestingModule,
                RouterTestingModule.withRoutes([
                    { path: 'game-creation', component: TestComponent },
                    { path: 'groups', component: GroupsPageComponent },
                ]),
            ],
            providers: [
                MatDialog,
                {
                    provide: MatDialogRef,
                    useClass: MatDialogMock,
                },
                { provide: MAT_DIALOG_DATA, useValue: { group: TEST_GROUP } },
            ],
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
