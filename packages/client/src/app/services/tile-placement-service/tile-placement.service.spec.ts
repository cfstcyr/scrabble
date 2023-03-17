import { TestBed } from '@angular/core/testing';

import { TilePlacementService } from './tile-placement.service';

describe('TilePlacementService', () => {
  let service: TilePlacementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TilePlacementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
