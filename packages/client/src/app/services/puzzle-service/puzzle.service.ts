import { Injectable } from '@angular/core';
import { PuzzleController } from '@app/controllers/puzzle-controller/puzzle.controller';
import { Puzzle, PuzzleResult } from '@common/models/puzzle';
import { WordPlacement } from '@common/models/word-finding';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class PuzzleService {
    constructor(private readonly puzzleController: PuzzleController) {}

    start(): Observable<Puzzle> {
        return this.puzzleController.start();
    }

    complete(wordPlacement: WordPlacement): Observable<PuzzleResult> {
        return this.puzzleController.complete(wordPlacement);
    }

    abandon(): Observable<PuzzleResult> {
        return this.puzzleController.abandon();
    }
}
