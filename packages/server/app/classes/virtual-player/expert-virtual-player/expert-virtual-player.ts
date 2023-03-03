import { ActionExchange, ActionPass, ActionPlace } from '@app/classes/actions';
import { ActionData } from '@app/classes/communication/action-data';
import Range from '@app/classes/range/range';
import { AbstractVirtualPlayer } from '@app/classes/virtual-player/abstract-virtual-player/abstract-virtual-player';
import { WordFindingRequest, WordFindingUseCase } from '@app/classes/word-finding';
import { Random } from '@app/utils/random/random';

export const MAX_EXPERT_CONSECUTIVE_EXCHANGES = 3;

export class ExpertVirtualPlayer extends AbstractVirtualPlayer {
    private consecutiveExchangeCount = 0;

    protected isExchangePossible(): boolean {
        return this.getActiveGameService().getGame(this.gameId, this.id).getTotalTilesLeft() > 0;
    }

    protected async findAction(): Promise<ActionData> {
        const scoredWordPlacement = this.computeWordPlacement();
        return scoredWordPlacement ? ActionPlace.createActionData(scoredWordPlacement) : this.alternativeMove();
    }

    protected findPointRange(): Range {
        return new Range(0, Number.MAX_SAFE_INTEGER);
    }

    protected alternativeMove(): ActionData {
        if (this.wordFindingInstance) {
            const bestMove = this.wordFindingInstance.wordPlacements.pop();
            if (bestMove) {
                this.consecutiveExchangeCount = 0;
                return ActionPlace.createActionData(bestMove);
            }
        }

        if (this.isExchangePossible() && this.consecutiveExchangeCount < MAX_EXPERT_CONSECUTIVE_EXCHANGES) {
            this.consecutiveExchangeCount++;
            const totalTilesLeft = this.getActiveGameService().getGame(this.gameId, this.id).getTotalTilesLeft();
            return ActionExchange.createActionData(Random.getRandomElementsFromArray(this.tiles, totalTilesLeft));
        }

        return ActionPass.createActionData();
    }

    protected generateWordFindingRequest(): WordFindingRequest {
        return {
            pointRange: this.findPointRange(),
            useCase: WordFindingUseCase.Expert,
            pointHistory: this.pointHistory,
        };
    }
}
