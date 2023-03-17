import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseBlankTileDialogComponent } from './choose-blank-tile-dialog.component';

describe('ChooseBlankTileDialogComponent', () => {
  let component: ChooseBlankTileDialogComponent;
  let fixture: ComponentFixture<ChooseBlankTileDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChooseBlankTileDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChooseBlankTileDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
