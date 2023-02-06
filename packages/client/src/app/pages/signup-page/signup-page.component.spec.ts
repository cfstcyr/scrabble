import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TileComponent } from '@app/components/tile/tile.component';
import { SignUpPageComponent } from './signup-page.component';

describe('SignInPageComponent', () => {
    let component: SignUpPageComponent;
    let fixture: ComponentFixture<SignUpPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SignUpPageComponent, TileComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SignUpPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
