import { Injectable } from '@angular/core';
import { Square } from '@app/classes/square';
import { Observable, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export default class BoardService {
    private initialBoard: Square[][] = [];
    private boardInitialization$: Subject<Square[][]> = new Subject();
    private boardUpdateEvent$: Subject<Square[]> = new Subject();

    initializeBoard(board: Square[][]): void {
        this.initialBoard = [...board];
        this.boardInitialization$.next(this.initialBoard);
    }

    subscribeToInitializeBoard(destroy$: Observable<boolean>, next: (board: Square[][]) => void): Subscription {
        return this.boardInitialization$.pipe(takeUntil(destroy$)).subscribe(next);
    }

    updateBoard(squaresUpdated: Square[]): void {
        this.boardUpdateEvent$.next(squaresUpdated);
    }

    subscribeToBoardUpdate(destroy$: Observable<boolean>, next: (squaresToUpdate: Square[]) => void): Subscription {
        return this.boardUpdateEvent$.pipe(takeUntil(destroy$)).subscribe(next);
    }

    readInitialBoard(): Square[][] {
        return [...this.initialBoard];
    }
}
