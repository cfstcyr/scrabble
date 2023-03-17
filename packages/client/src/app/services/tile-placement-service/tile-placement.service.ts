import { Injectable } from '@angular/core';
import { Orientation } from '@app/classes/actions/orientation';
import { Position } from '@app/classes/board-navigator/position';
import { TilePlacement } from '@app/classes/tile';
import { CANNOT_REMOVE_UNUSED_TILE } from '@app/constants/component-errors';
import { BOARD_SIZE } from '@app/constants/game-constants';
import { BehaviorSubject, Observable } from 'rxjs';
import BoardService from '@app/services/board-service/board.service';
import { BoardNavigator } from '@app/classes/board-navigator/board-navigator';
import { comparePlacements, comparePositions } from '@app/utils/comparator/comparator';
import { PlaceActionPayload } from '@app/classes/actions/action-data';

@Injectable({
    providedIn: 'root',
})
export class TilePlacementService {
    private tilePlacementsSubject$: BehaviorSubject<TilePlacement[]>;
    private isPlacementValidSubject$: BehaviorSubject<boolean>;

    constructor(private readonly boardService: BoardService) {
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

        const index = placements.findIndex((t) => comparePlacements(t, previousPlacement));

        if (index >= 0) {
            placements.splice(index, 1);
            placements.push(tilePlacement);

            this.tilePlacementsSubject$.next(placements);
        }

        this.updatePlacement();
    }

    removeTile(tilePlacement: TilePlacement): void {
        const placements = [...this.tilePlacements];

        const index = placements.findIndex((t) => comparePlacements(t, tilePlacement));

        if (index < 0) throw new Error(CANNOT_REMOVE_UNUSED_TILE);

        placements.splice(index, 1);
        this.tilePlacementsSubject$.next(placements);
        this.updatePlacement();
    }

    resetTiles(): void {
        this.tilePlacementsSubject$.next([]);
        this.updatePlacement();
    }

    createPlaceActionPayload(): PlaceActionPayload | undefined {
        let tilePlacements = [...this.tilePlacements];
        const orientation = this.getPlacementOrientation(tilePlacements);

        if (orientation === undefined) return undefined;

        tilePlacements = this.sortTilePlacements(tilePlacements, orientation);

        return {
            orientation,
            startPosition: tilePlacements[0].position,
            tiles: tilePlacements.map(({ tile }) => tile),
        };
    }

    private updatePlacement(): void {
        this.isPlacementValidSubject$.next(this.validatePlacement());
    }

    private validatePlacement(): boolean {
        let tilePlacements = [...this.tilePlacements];
        const orientation = this.getPlacementOrientation(tilePlacements);

        if (orientation === undefined) return false;

        if (this.placementIncludesMiddle(tilePlacements)) return true;

        tilePlacements = this.sortTilePlacements(tilePlacements, orientation);

        const navigator = this.boardService.navigator?.clone();

        if (!navigator) return false;

        navigator.setPosition(tilePlacements[0].position);
        navigator.orientation = orientation;
        let index = 0;
        let hasNeighbors = this.placementStartsOrEndsWithNeighbor(tilePlacements, navigator);

        // We iterate through the placement
        while (navigator.isWithinBounds()) {
            const placement = tilePlacements[index];

            // We check wether the current position has the desired tile
            if (comparePositions(placement.position, navigator.getPosition())) {
                // If the desired tile is present, go to next tile
                index++;
                // We check if the tile as a neighbors.
                if (navigator.hasNonEmptyNeighbor()) {
                    hasNeighbors = true;
                }
                // If we went through all the tiles without a problem, then the placement is valid
                if (index === tilePlacements.length) return hasNeighbors;
            } else {
                // If the desired tile is not present, than we make sure that an existing tile is present.
                // If not, then there is a gap in the placement, it is invalid.
                if (navigator.isEmpty()) {
                    return false;
                } else {
                    // If there is an existing tile within the placement, than the placement is a neighbors to an existing tile.
                    hasNeighbors = true;
                }
            }

            navigator.forward();
        }

        throw new Error('I did something bad.');
    }

    private getPlacementOrientation(tilePlacements: TilePlacement[]): Orientation | undefined {
        tilePlacements = [...tilePlacements];
        const firstPlacement = tilePlacements.pop();

        if (!firstPlacement) return;
        if (tilePlacements.length === 0) return Orientation.Horizontal;

        const { row, column } = firstPlacement.position;

        if (tilePlacements.every(({ position }) => position.row === row)) return Orientation.Horizontal;
        if (tilePlacements.every(({ position }) => position.column === column)) return Orientation.Vertical;

        return undefined;
    }

    private placementIncludesMiddle(tilePlacements: TilePlacement[]): boolean {
        return tilePlacements.some(
            (placement) => placement.position.row === Math.floor(BOARD_SIZE / 2) && placement.position.column === Math.floor(BOARD_SIZE / 2),
        );
    }

    private sortTilePlacements(tilePlacements: TilePlacement[], orientation: Orientation): TilePlacement[] {
        return tilePlacements.sort(({ position: { row: rowA, column: colA } }, { position: { row: rowB, column: colB } }) =>
            orientation === Orientation.Vertical ? (rowA > rowB ? 1 : -1) : colA > colB ? 1 : -1,
        );
    }

    private placementStartsOrEndsWithNeighbor(tilePlacements: TilePlacement[], navigator: BoardNavigator): boolean {
        navigator = navigator.clone();

        navigator.setPosition(tilePlacements[0].position);

        if (!navigator.clone().backward().isEmpty()) return true;

        if (
            !navigator
                .clone()
                .setPosition(tilePlacements[tilePlacements.length - 1].position)
                .forward()
                .isEmpty()
        )
            return true;

        return false;
    }
}
