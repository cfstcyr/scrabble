import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { IconComponent } from '@app/components/icon/icon.component';
import { PageHeaderComponent } from './page-header.component';

@Component({
    template: '',
})
class TestComponent {}

describe('PageHeaderComponent', () => {
    let component: PageHeaderComponent;
    let fixture: ComponentFixture<PageHeaderComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PageHeaderComponent, IconComponent],
            imports: [
                BrowserAnimationsModule,
                MatCardModule,
                RouterTestingModule.withRoutes([
                    { path: 'lobby', component: TestComponent },
                    { path: 'home', component: TestComponent },
                    { path: 'game-creation', component: TestComponent },
                ]),
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PageHeaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
