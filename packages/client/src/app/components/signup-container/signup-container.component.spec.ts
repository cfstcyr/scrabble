import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupContainerComponent } from './signup-container.component';

describe('SignupContainerComponent', () => {
  let component: SignupContainerComponent;
  let fixture: ComponentFixture<SignupContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SignupContainerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SignupContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
