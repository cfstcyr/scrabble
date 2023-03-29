import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameObserversPlayersComponent } from './game-observers-players.component';

describe('GameObserversPlayersComponent', () => {
  let component: GameObserversPlayersComponent;
  let fixture: ComponentFixture<GameObserversPlayersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GameObserversPlayersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GameObserversPlayersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
