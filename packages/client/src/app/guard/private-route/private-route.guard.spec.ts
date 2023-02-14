import { TestBed } from '@angular/core/testing';

import { PrivateRouteGuard } from './private-route.guard';

describe('PrivateRouteGuard', () => {
  let guard: PrivateRouteGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(PrivateRouteGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
