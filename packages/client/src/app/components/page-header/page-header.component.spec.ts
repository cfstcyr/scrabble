import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { IconComponent } from '@app/components/icon/icon.component';
import { HeaderBtnComponent } from '@app/components/header-btn/header-btn.component';
import { PageHeaderComponent } from './page-header.component';
import { AuthenticationService } from '@app/services/authentication-service/authentication.service';
import { Location } from '@angular/common';

@Component({
    template: '',
})
class TestComponent {}

describe('PageHeaderComponent', () => {
    let component: PageHeaderComponent;
    let fixture: ComponentFixture<PageHeaderComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PageHeaderComponent, IconComponent, HeaderBtnComponent],
            imports: [
                BrowserAnimationsModule,
                MatCardModule,
                RouterTestingModule.withRoutes([{ path: 'login', component: TestComponent }]),
                HttpClientTestingModule,
                MatSnackBarModule,
                MatMenuModule,
            ],
            providers: [AuthenticationService],
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

    describe('signOut', () => {
        let signOutSpy: jasmine.Spy;

        beforeEach(() => {
            const authenticationService = TestBed.inject(AuthenticationService);
            signOutSpy = spyOn(authenticationService, 'signOut');
        });

        it('should call signOut', () => {
            component.signOut();

            expect(signOutSpy).toHaveBeenCalled();
        });

        it('should navigate to login', fakeAsync(() => {
            const location = TestBed.inject(Location);
            component.signOut();

            tick();

            expect(location.path()).toEqual('/login');
        }));
    });
});
