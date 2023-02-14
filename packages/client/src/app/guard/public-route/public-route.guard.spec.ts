import { TestBed } from '@angular/core/testing';

import { PublicRouteGuard } from './public-route.guard';

describe('PublicRouteGuard', () => {
  let guard: PublicRouteGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(PublicRouteGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
