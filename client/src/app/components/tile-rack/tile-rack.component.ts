import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActionPlacePayload } from '@app/classes/actions/action-data';
import { AbstractPlayer } from '@app/classes/player';
import { Tile } from '@app/classes/tile';
import { TileRackSelectType } from '@app/classes/tile-rack-select-type';
import { ESCAPE } from '@app/constants/components-constants';
import { RACK_TILE_DEFAULT_FONT_SIZE } from '@app/constants/tile-font-size';
import { GameService } from '@app/services';
import { FocusableComponent } from '@app/services/focusable-components/focusable-component';
import { FocusableComponentsService } from '@app/services/focusable-components/focusable-components.service';
import { GameButtonActionService } from '@app/services/game-button-action/game-button-action.service';
import { GameViewEventManagerService } from '@app/services/game-view-event-manager/game-view-event-manager.service';
import { Subject } from 'rxjs';

export type RackTile = Tile & { isUsed: boolean; isSelected: boolean };

@Component({
    selector: 'app-tile-rack',
    templateUrl: './tile-rack.component.html',
    styleUrls: ['./tile-rack.component.scss', './tile-rack.component.2.scss'],
})
export class TileRackComponent extends FocusableComponent<KeyboardEvent> implements OnInit, OnDestroy {
    tiles: RackTile[];
    selectedTiles: RackTile[];
    selectionType: TileRackSelectType;
    tileFontSize: number;
    componentDestroyed$: Subject<boolean>;

    constructor(
        public gameService: GameService,
        private readonly focusableComponentService: FocusableComponentsService,
        private readonly gameViewEventManagerService: GameViewEventManagerService,
        private readonly gameButtonActionService: GameButtonActionService,
    ) {
        super();
        this.selectedTiles = [];
        this.selectionType = TileRackSelectType.Exchange;
        this.tileFontSize = RACK_TILE_DEFAULT_FONT_SIZE;
        this.componentDestroyed$ = new Subject();
    }

    ngOnInit(): void {
        this.subscribeToFocusableEvents();
        this.updateTileRack();
        this.gameViewEventManagerService.subscribeToGameViewEvent('tileRackUpdate', this.componentDestroyed$, () => this.updateTileRack());
        this.gameViewEventManagerService.subscribeToGameViewEvent('usedTiles', this.componentDestroyed$, (payload) => this.handleUsedTiles(payload));
    }

    ngOnDestroy(): void {
        this.unsubscribeToFocusableEvents();
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.complete();
    }

    selectTile(selectType: TileRackSelectType, tile: RackTile): boolean {
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

    selectTileExchange(tile: RackTile): boolean {
        return this.selectTile(TileRackSelectType.Exchange, tile);
    }

    selectTileMove(tile: RackTile): boolean {
        return this.selectTile(TileRackSelectType.Move, tile);
    }

    unselectTile(tile: RackTile): void {
        tile.isSelected = false;
        const index = this.selectedTiles.indexOf(tile);
        if (index >= 0) {
            this.selectedTiles.splice(index, 1);
        }
    }

    unselectAll(): void {
        this.selectedTiles.forEach((t) => (t.isSelected = false));
        this.selectedTiles = [];
    }

    focus(): void {
        this.focusableComponentService.setActiveKeyboardComponent(this);
    }

    canExchangeTiles(): boolean {
        return this.selectionType === TileRackSelectType.Exchange && this.selectedTiles.length > 0 && this.gameService.isLocalPlayerPlaying();
    }

    exchangeTiles(): void {
        if (!this.canExchangeTiles()) return;

        this.gameButtonActionService.sendExchangeAction(this.selectedTiles);
        this.selectedTiles.forEach((tile) => (tile.isUsed = true));
        this.unselectAll();
    }

    protected onLoseFocusEvent(): void {
        this.unselectAll();
    }

    protected onFocusableEvent(e: KeyboardEvent): void {
        switch (e.key) {
            case ESCAPE:
                this.unselectAll();
                break;
        }
    }

    private updateTileRack(): void {
        this.tiles = [];
        const localPlayer: AbstractPlayer | undefined = this.gameService.getLocalPlayer();
        const localPlayerTiles = localPlayer?.getTiles();
        if (localPlayer && localPlayerTiles) {
            localPlayer.getTiles().forEach((tile: Tile) => {
                this.tiles.push({ ...tile, playedLetter: undefined, isUsed: false, isSelected: false });
            });
        }
    }

    private handleUsedTiles(usedTilesPayload: ActionPlacePayload | undefined): void {
        if (!usedTilesPayload) {
            this.tiles.forEach((tile) => (tile.isUsed = false));
            return;
        }

        const usedTiles = [...usedTilesPayload.tiles];

        for (const tile of this.tiles) {
            const index = usedTiles.findIndex((usedTile) => usedTile.letter === tile.letter);
            tile.isUsed = index >= 0;
            if (index >= 0) usedTiles.splice(index, 1);
        }
    }
}
