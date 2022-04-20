import { Injectable, OnDestroy } from '@angular/core';
import { ActionData, ActionPayload, ActionType, ExchangeActionPayload, PlaceActionPayload } from '@app/classes/actions/action-data';
import { Orientation } from '@app/classes/actions/orientation';
import { Position } from '@app/classes/board-navigator/position';
import { Tile } from '@app/classes/tile';
import { WAIT_FOR_COMMAND_CONFIRMATION_MESSAGE } from '@app/constants/services-errors';
import { GamePlayController } from '@app/controllers/game-play-controller/game-play.controller';
import { GameViewEventManagerService } from '@app/services/game-view-event-manager-service/game-view-event-manager.service';
import { ActionPayloadToString } from '@app/utils/action-payload-to-string/action-payload-to-string';
import { IResetServiceData } from '@app/utils/i-reset-service-data/i-reset-service-data';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class ActionService implements IResetServiceData, OnDestroy {
    hasActionBeenPlayed: boolean;
    private serviceDestroyed$: Subject<boolean>;

    constructor(private gamePlayController: GamePlayController, private readonly gameViewEventManagerService: GameViewEventManagerService) {
        this.hasActionBeenPlayed = false;
        this.serviceDestroyed$ = new Subject();
        this.gamePlayController
            .observeActionDone()
            .pipe(takeUntil(this.serviceDestroyed$))
            .subscribe(() => this.resetHasActionBeenSent());
        this.gameViewEventManagerService.subscribeToGameViewEvent('resetUsedTiles', this.serviceDestroyed$, () => this.handleResetUsedTiles());
        this.gameViewEventManagerService.subscribeToGameViewEvent('resetServices', this.serviceDestroyed$, () => this.resetServiceData());
    }

    ngOnDestroy(): void {
        this.serviceDestroyed$.next(true);
        this.serviceDestroyed$.complete();
    }

    createPlaceActionPayload(tiles: Tile[], startPosition: Position, orientation: Orientation): PlaceActionPayload {
        return {
            tiles,
            startPosition,
            orientation,
        };
    }

    createExchangeActionPayload(tiles: Tile[]): ExchangeActionPayload {
        return { tiles };
    }

    createActionData(actionType: ActionType, actionPayload: ActionPayload, input?: string, needsInput: boolean = false): ActionData {
        if (!input) input = this.actionNeedsInput(actionType, needsInput) ? this.createInputFromPayload(actionType, actionPayload) : '';

        return {
            type: actionType,
            input,
            payload: actionPayload,
        };
    }

    sendAction(gameId: string, playerId: string | undefined, actionData: ActionData): void {
        if (!playerId) return;
        if (this.hasActionBeenPlayed) {
            this.sendWaitForConfirmationMessage(gameId, playerId);
            return;
        }

        this.gamePlayController.sendAction(gameId, playerId, actionData);
        this.hasActionBeenPlayed = true;
    }

    resetServiceData(): void {
        this.hasActionBeenPlayed = false;
    }

    private actionNeedsInput(actionType: ActionType, needsInput: boolean): boolean {
        return actionType === ActionType.PLACE || actionType === ActionType.EXCHANGE || needsInput;
    }

    private createInputFromPayload(actionType: ActionType, payload: ActionPayload): string {
        switch (actionType) {
            case ActionType.PLACE:
                return ActionPayloadToString.placeActionPayloadToString(payload as PlaceActionPayload);
            case ActionType.EXCHANGE:
                return ActionPayloadToString.exchangeActionPayloadToString(payload as ExchangeActionPayload);
            default:
                return ActionPayloadToString.simpleActionToString(actionType);
        }
    }

    private sendWaitForConfirmationMessage(gameId: string, playerId: string): void {
        this.gamePlayController.sendError(gameId, playerId, WAIT_FOR_COMMAND_CONFIRMATION_MESSAGE(gameId));
    }

    private resetHasActionBeenSent(): void {
        this.hasActionBeenPlayed = false;
    }

    private handleResetUsedTiles(): void {
        const usedTiles: PlaceActionPayload | undefined = this.gameViewEventManagerService.getGameViewEventValue('usedTiles');
        if (usedTiles) {
            usedTiles.tiles.forEach((tile: Tile) => {
                if (tile.isBlank) tile.playedLetter = undefined;
            });
        }
        this.gameViewEventManagerService.emitGameViewEvent('usedTiles', undefined);
    }
}
