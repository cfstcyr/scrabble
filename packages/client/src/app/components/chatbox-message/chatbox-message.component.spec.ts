import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatboxMessageComponent } from './chatbox-message.component';

describe('ChatboxMessageComponent', () => {
  let component: ChatboxMessageComponent;
  let fixture: ComponentFixture<ChatboxMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatboxMessageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatboxMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
