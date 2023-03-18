import { TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';

import { DragAndDropService } from './drag-and-drop.service';

describe('DragAndDropService', () => {
    let service: DragAndDropService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatDialogModule],
        });
        service = TestBed.inject(DragAndDropService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
