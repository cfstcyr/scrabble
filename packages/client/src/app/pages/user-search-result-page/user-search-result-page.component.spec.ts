import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserSearchResultPageComponent } from './user-search-result-page.component';

describe('UserSearchResultPageComponent', () => {
  let component: UserSearchResultPageComponent;
  let fixture: ComponentFixture<UserSearchResultPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserSearchResultPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserSearchResultPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
