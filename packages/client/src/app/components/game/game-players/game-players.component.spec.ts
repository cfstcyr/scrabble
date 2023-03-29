import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GamePlayersComponent } from './game-players.component';

describe('GamePlayersComponent', () => {
  let component: GamePlayersComponent;
  let fixture: ComponentFixture<GamePlayersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GamePlayersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GamePlayersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
