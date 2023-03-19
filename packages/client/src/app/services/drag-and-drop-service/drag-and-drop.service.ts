import { CdkDragMove } from '@angular/cdk/drag-drop';
import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Position } from '@app/classes/board-navigator/position';
import { Tile } from '@app/classes/tile';
import { TilePlacementService } from '@app/services/tile-placement-service/tile-placement.service';

const SQUARE_CLASS = 'square';
const HAS_TILE_CLASS = 'has-tile';
const HOVERED_SQUARE_CLASS = 'square--hovered';
const TILE_RACK_CLASS = 'tile-rack';
const HOVERED_TILE_RACK_CLASS = 'tile-rack--hovered';

interface HoveredSquare {
    element: Element;
    position: Position;
}

@Injectable({
    providedIn: 'root',
})
export class DragAndDropService {
    private currentHoveredTileRackElement?: Element;
    private currentHoveredSquare?: HoveredSquare;

    constructor(@Inject(DOCUMENT) private readonly document: Document, private readonly tilePlacementService: TilePlacementService) {}

    onRackTileMove(event: CdkDragMove<HTMLElement>): void {
        this.onTileMove(event);
    }

    onBoardTileMove(event: CdkDragMove<HTMLElement>): void {
        this.onTileMove(event);

        const hoveredTileRackElement = this.getHoveredTileRackElement(event);

        if (!hoveredTileRackElement) {
            this.removeCurrentHoveredTileRackElement();
            return;
        }

        this.setCurrentHoveredTileRackElement(hoveredTileRackElement);
    }

    onRackTileDrop(tile: Tile): void {
        if (this.currentHoveredSquare) {
            this.tilePlacementService.placeTile({
                tile,
                position: this.currentHoveredSquare.position,
            });
        }

        this.removeCurrentHoveredSquare();
    }

    onBoardTileDrop(tile: Tile, previousPosition: Position): void {
        if (this.currentHoveredSquare) {
            this.tilePlacementService.moveTile(
                {
                    tile,
                    position: this.currentHoveredSquare.position,
                },
                previousPosition,
            );

            this.removeCurrentHoveredSquare();
        } else if (this.currentHoveredTileRackElement) {
            this.tilePlacementService.removeTile({ tile, position: previousPosition });

            this.removeCurrentHoveredTileRackElement();
        }
    }

    private onTileMove(event: CdkDragMove<HTMLElement>): void {
        const hoveredSquare = this.getHoveredSquare(event);

        if (!hoveredSquare) {
            this.removeCurrentHoveredSquare();
            return;
        }

        this.setCurrentHoveredSquare(hoveredSquare);
    }

    private getHoveredSquare(event: CdkDragMove<HTMLElement>): HoveredSquare | undefined {
        const elementFromPoint = this.document.elementFromPoint(event.pointerPosition.x, event.pointerPosition.y);

        if (!elementFromPoint) return;

        const squareElement = this.isSquareElement(elementFromPoint) ? elementFromPoint : elementFromPoint.closest(`.${SQUARE_CLASS}`);

        if (!squareElement) return;

        if (squareElement.classList.contains(HAS_TILE_CLASS)) return;

        const columnAttr = squareElement.attributes.getNamedItem('column');
        const rowAttr = squareElement.attributes.getNamedItem('row');

        if (!columnAttr || !rowAttr) return;

        return { element: squareElement, position: { column: Number(columnAttr.value), row: Number(rowAttr.value) } };
    }

    private getHoveredTileRackElement(event: CdkDragMove<HTMLElement>): Element | undefined {
        const elementFromPoint = this.document.elementFromPoint(event.pointerPosition.x, event.pointerPosition.y);

        if (!elementFromPoint) return;

        const tileRackElement = this.isTileRackElement(elementFromPoint) ? elementFromPoint : elementFromPoint.closest(`.${TILE_RACK_CLASS}`);

        return tileRackElement ?? undefined;
    }

    private setCurrentHoveredSquare(hoveredSquare: HoveredSquare): void {
        this.removeCurrentHoveredSquare();

        this.currentHoveredSquare = hoveredSquare;
        this.currentHoveredSquare.element.classList.add(HOVERED_SQUARE_CLASS);
    }

    private removeCurrentHoveredSquare(): void {
        if (!this.currentHoveredSquare) return;

        this.currentHoveredSquare.element.classList.remove(HOVERED_SQUARE_CLASS);
        this.currentHoveredSquare = undefined;
    }

    private setCurrentHoveredTileRackElement(element: Element): void {
        this.removeCurrentHoveredTileRackElement();

        this.currentHoveredTileRackElement = element;
        this.currentHoveredTileRackElement.classList.add(HOVERED_TILE_RACK_CLASS);
    }

    private removeCurrentHoveredTileRackElement(): void {
        if (!this.currentHoveredTileRackElement) return;

        this.currentHoveredTileRackElement.classList.remove(HOVERED_TILE_RACK_CLASS);
        this.currentHoveredTileRackElement = undefined;
    }

    private isSquareElement(element: Element): boolean {
        return element.classList.contains(SQUARE_CLASS);
    }

    private isTileRackElement(element: Element): boolean {
        return element.classList.contains(TILE_RACK_CLASS);
    }
}
