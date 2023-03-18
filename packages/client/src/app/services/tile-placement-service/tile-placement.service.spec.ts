import { TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';

import { TilePlacementService } from './tile-placement.service';

describe('TilePlacementService', () => {
    let service: TilePlacementService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatDialogModule],
        });
        service = TestBed.inject(TilePlacementService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
