import { Injectable } from '@angular/core';
import { AbstractController } from '@app/controllers/abstract-controller';
import { Observable } from 'rxjs';
import { Puzzle, PuzzleResult } from '@common/models/puzzle';
import { HttpClient } from '@angular/common/http';
import { WordPlacement } from '@common/models/word-finding';

@Injectable({
    providedIn: 'root',
})
export class PuzzleController extends AbstractController {
    constructor(private readonly http: HttpClient) {
        super('/puzzles');
    }

    start(): Observable<Puzzle> {
        return this.http.post<Puzzle>(this.url('/start'), {});
    }

    complete(wordPlacement: WordPlacement): Observable<PuzzleResult> {
        return this.http.post<PuzzleResult>(this.url('/complete'), { wordPlacement });
    }

    abandon(): Observable<PuzzleResult> {
        return this.http.post<PuzzleResult>(this.url('/abandon'), {});
    }
}
