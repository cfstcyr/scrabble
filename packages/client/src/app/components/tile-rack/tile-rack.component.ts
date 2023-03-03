import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActionType, PlaceActionPayload } from '@app/classes/actions/action-data';
import Direction from '@app/classes/board-navigator/direction';
import { FocusableComponent } from '@app/classes/focusable-component/focusable-component';
import { Tile } from '@app/classes/tile';
import { ARROW_LEFT, ARROW_RIGHT, ESCAPE } from '@app/constants/components-constants';
import { MAX_TILES_PER_PLAYER } from '@app/constants/game-constants';
import { RACK_TILE_DEFAULT_FONT_SIZE } from '@app/constants/tile-font-size-constants';
import { TileRackSelectType } from '@app/constants/tile-rack-select-type';
import { GameService } from '@app/services';
import { ActionService } from '@app/services/action-service/action.service';
import { FocusableComponentsService } from '@app/services/focusable-components-service/focusable-components.service';
import { GameViewEventManagerService } from '@app/services/game-view-event-manager-service/game-view-event-manager.service';
import Delay from '@app/utils/delay/delay';
import { nextIndex } from '@app/utils/next-index/next-index';
import { preserveArrayOrder } from '@app/utils/preserve-array-order/preserve-array-order';
import { Random } from '@app/utils/random/random';
import { pipe, Subject } from 'rxjs';

export type RackTile = Tile & { isUsed: boolean; isSelected: boolean };
const SHUFFLE_ANIMATION_DELAY = 250;

@Component({
    selector: 'app-tile-rack',
    templateUrl: './tile-rack.component.html',
    styleUrls: ['./tile-rack.component.scss', './tile-rack-2.component.scss'],
})
export class TileRackComponent extends FocusableComponent<KeyboardEvent> implements OnInit, OnDestroy {
    tiles: RackTile[];
    selectedTiles: RackTile[];
    selectionType: TileRackSelectType;
    tileFontSize: number;
    isShuffling: boolean;

    private componentDestroyed$: Subject<boolean>;

    constructor(
        public gameService: GameService,
        private readonly focusableComponentService: FocusableComponentsService,
        private readonly gameViewEventManagerService: GameViewEventManagerService,
        private readonly actionService: ActionService,
    ) {
        super();
        this.tiles = [];
        this.selectedTiles = [];
        this.selectionType = TileRackSelectType.Exchange;
        this.tileFontSize = RACK_TILE_DEFAULT_FONT_SIZE;
        this.isShuffling = false;
        this.componentDestroyed$ = new Subject();
    }

    ngOnInit(): void {
        this.subscribeToFocusableEvents();
        this.updateTileRack(this.gameService.getLocalPlayerId());
        this.gameViewEventManagerService.subscribeToGameViewEvent('tileRackUpdate', this.componentDestroyed$, (playerId: string) =>
            this.updateTileRack(playerId),
        );
        this.gameViewEventManagerService.subscribeToGameViewEvent('usedTiles', this.componentDestroyed$, (payload) => this.handleUsedTiles(payload));
        this.gameViewEventManagerService.subscribeToGameViewEvent('resetUsedTiles', this.componentDestroyed$, () => this.resetUsedTiles());
    }

    ngOnDestroy(): void {
        this.unsubscribeToFocusableEvents();
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.complete();
    }

    selectTileToExchange(tile: RackTile): boolean {
        return this.selectTile(TileRackSelectType.Exchange, tile);
    }

    selectTileToMove(tile: RackTile): boolean {
        return this.selectTile(TileRackSelectType.Move, tile);
    }

    unselectAll(): void {
        this.selectedTiles.forEach((rackTile: RackTile) => (rackTile.isSelected = false));
        this.selectedTiles = [];
    }

    focus(): void {
        this.focusableComponentService.setActiveKeyboardComponent(this);
    }

    canExchangeTiles(): boolean {
        return (
            this.selectionType === TileRackSelectType.Exchange &&
            this.selectedTiles.length > 0 &&
            this.gameService.isLocalPlayerPlaying() &&
            this.gameService.getTotalNumberOfTilesLeft() >= MAX_TILES_PER_PLAYER &&
            !this.actionService.hasActionBeenPlayed
        );
    }

    exchangeTiles(): void {
        if (!this.canExchangeTiles()) return;

        this.actionService.sendAction(
            this.gameService.getGameId(),
            this.actionService.createActionData(ActionType.EXCHANGE, this.actionService.createExchangeActionPayload(this.selectedTiles)),
        );
        this.selectedTiles.forEach((tile) => (tile.isUsed = true));
        this.unselectAll();
    }

    onScroll(event: WheelEvent): void {
        this.moveSelectedTile(event.deltaY);
    }

    async shuffleTiles(): Promise<void> {
        this.isShuffling = true;
        await Delay.for(SHUFFLE_ANIMATION_DELAY);
        this.tiles = Random.randomize(this.tiles);
        await Delay.for(1);
        this.isShuffling = false;
    }

    protected onLoseFocusEvent(): void {
        this.unselectAll();
    }

    protected onFocusableEvent(event: KeyboardEvent): void {
        switch (event.key) {
            case ESCAPE:
                this.unselectAll();
                break;
            case ARROW_LEFT:
                this.moveSelectedTile(Direction.Left);
                break;
            case ARROW_RIGHT:
                this.moveSelectedTile(Direction.Right);
                break;
            default:
                this.selectTileFromKey(event.key);
        }
    }

    private selectTile(selectType: TileRackSelectType, tile: RackTile): boolean {
        this.focus();

        if (this.selectionType === selectType && tile.isSelected) {
            this.unselectTile(tile);
            return false;
        }

        if (this.selectionType !== selectType || selectType === TileRackSelectType.Move) {
            this.selectionType = selectType;
            this.unselectAll();
        }

        tile.isSelected = true;
        this.selectedTiles.push(tile);

        return false; // return false so the browser doesn't show the context menu
    }

    private unselectTile(tile: RackTile): void {
        tile.isSelected = false;
        const index = this.selectedTiles.indexOf(tile);
        if (index >= 0) {
            this.selectedTiles.splice(index, 1);
        }
    }

    private selectTileFromKey(key: string): void {
        const tiles = this.tiles.filter((tile) => tile.letter.toLowerCase() === key.toLowerCase());

        if (tiles.length === 0) return this.unselectAll();

        pipe(this.getSelectedTileIndex, nextIndex(tiles.length), (index) => tiles[index], this.selectTileToMove.bind(this))(tiles);
    }

    private moveSelectedTile(direction: Direction | number): void {
        if (this.selectionType !== TileRackSelectType.Move) return;
        if (this.selectedTiles.length === 0) return;

        const tile = this.selectedTiles[0];
        const index = this.tiles.indexOf(tile);

        let newIndex = (index + direction) % this.tiles.length;
        if (newIndex < 0) newIndex += this.tiles.length;

        this.tiles.splice(index, 1);
        this.tiles.splice(newIndex, 0, tile);
    }

    private updateTileRack(playerId?: string): void {
        const player = this.gameService.getLocalPlayer();
        if (!player) return;
        if (playerId !== this.gameService.getLocalPlayerId()) return;

        const previousTiles: RackTile[] = [...this.tiles];
        const newTiles: Tile[] = [...player.getTiles()];
        this.tiles = preserveArrayOrder(newTiles, previousTiles, (elem1: Tile, elem2: RackTile) => elem1.letter === elem2.letter).map(
            (tile: Tile, index: number) => this.createRackTile(tile, this.tiles[index]),
        );
    }

    private createRackTile(tile: Tile, rackTile: RackTile): RackTile {
        return { ...tile, isUsed: false, isSelected: rackTile && rackTile.isSelected };
    }

    private handleUsedTiles(usedTilesPayload: PlaceActionPayload | undefined): void {
        if (!usedTilesPayload) return;

        const usedTiles = [...usedTilesPayload.tiles];
        for (const tile of this.tiles) {
            const index = usedTiles.findIndex((usedTile) => usedTile.letter === tile.letter);
            tile.isUsed = index >= 0;
            if (index >= 0) usedTiles.splice(index, 1);
        }
    }

    private resetUsedTiles(): void {
        this.tiles.forEach((tile) => (tile.isUsed = false));
    }

    private getSelectedTileIndex(tiles: RackTile[]): number {
        return tiles.findIndex((tile) => tile.isSelected);
    }
}
