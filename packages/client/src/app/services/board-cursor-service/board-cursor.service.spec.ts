import { TestBed } from '@angular/core/testing';

import { BoardCursorService } from './board-cursor.service';
import { MatDialogModule } from '@angular/material/dialog';

describe('BoardCursorService', () => {
    let service: BoardCursorService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatDialogModule],
        });
        service = TestBed.inject(BoardCursorService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
