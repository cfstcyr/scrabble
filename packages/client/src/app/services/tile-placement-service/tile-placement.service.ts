import { Injectable } from '@angular/core';
import { Orientation } from '@app/classes/actions/orientation';
import { Position } from '@app/classes/board-navigator/position';
import { TilePlacement } from '@app/classes/tile';
import { CANNOT_REMOVE_UNUSED_TILE } from '@app/constants/component-errors';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class TilePlacementService {
    private tilePlacementsSubject$: BehaviorSubject<TilePlacement[]>;
    private isPlacementValidSubject$: BehaviorSubject<boolean>;

    constructor() {
        this.tilePlacementsSubject$ = new BehaviorSubject<TilePlacement[]>([]);
        this.isPlacementValidSubject$ = new BehaviorSubject<boolean>(false);
    }

    get tilePlacements$(): Observable<TilePlacement[]> {
        return this.tilePlacementsSubject$.asObservable();
    }

    get isPlacementValid$(): Observable<boolean> {
        return this.isPlacementValidSubject$.asObservable();
    }

    get tilePlacements(): TilePlacement[] {
        return this.tilePlacementsSubject$.value;
    }

    get isPlacementValid(): boolean {
        return this.isPlacementValidSubject$.value;
    }

    placeTile(tilePlacement: TilePlacement): void {
        this.tilePlacementsSubject$.next([...this.tilePlacementsSubject$.value, tilePlacement]);
        this.updatePlacement();
    }

    moveTile(tilePlacement: TilePlacement, previousPosition: Position): void {
        const placements = [...this.tilePlacements];
        const previousPlacement: TilePlacement = { ...tilePlacement, position: previousPosition };

        const index = placements.findIndex((t) => this.comparePlacements(t, previousPlacement));

        if (index >= 0) {
            placements.splice(index, 1);
            placements.push(tilePlacement);

            this.tilePlacementsSubject$.next(placements);
        }

        this.updatePlacement();
    }

    removeTile(tilePlacement: TilePlacement): void {
        const placements = [...this.tilePlacements];

        const index = placements.findIndex((t) => this.comparePlacements(t, tilePlacement));

        if (index < 0) throw new Error(CANNOT_REMOVE_UNUSED_TILE);

        placements.splice(index, 1);
        this.tilePlacementsSubject$.next(placements);
        this.updatePlacement();
    }

    resetTiles(): void {
        this.tilePlacementsSubject$.next([]);
        this.updatePlacement();
    }

    private updatePlacement(): void {
        this.isPlacementValidSubject$.next(this.validatePlacement());
    }

    private validatePlacement(): boolean {
        const tilePlacements = [...this.tilePlacements];
        const orientation = this.getPlacementOrientation(tilePlacements);

        if (orientation === undefined) return false;

        // TODO: validate
        return this.tilePlacements.length > 0;
    }

    private getPlacementOrientation(tilePlacements: TilePlacement[]): Orientation | undefined {
        const firstPlacement = tilePlacements.pop();

        if (!firstPlacement) return;
        if (tilePlacements.length === 0) return Orientation.Horizontal;

        const { row, column } = firstPlacement.position;

        if (tilePlacements.every(({ position }) => position.row === row)) return Orientation.Horizontal;
        if (tilePlacements.every(({ position }) => position.column === column)) return Orientation.Vertical;

        return undefined;
    }

    private comparePlacements(a: TilePlacement, b: TilePlacement): boolean {
        return (
            a.position.row === b.position.row &&
            a.position.column === a.position.column &&
            a.tile.letter === b.tile.letter &&
            a.tile.value === b.tile.value
        );
    }
}
