import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameTilesLeftComponent } from './game-tiles-left.component';

describe('GameTilesLeftComponent', () => {
  let component: GameTilesLeftComponent;
  let fixture: ComponentFixture<GameTilesLeftComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GameTilesLeftComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GameTilesLeftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
