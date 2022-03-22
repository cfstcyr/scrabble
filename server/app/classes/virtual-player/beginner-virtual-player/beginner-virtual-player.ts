import {
    EXCHANGE_ACTION_THRESHOLD,
    FINAL_WAIT_TIMEOUT,
    HIGH_SCORE_RANGE_MAX,
    HIGH_SCORE_RANGE_MIN,
    LOW_SCORE_RANGE_MAX,
    LOW_SCORE_RANGE_MIN,
    LOW_SCORE_THRESHOLD,
    MEDIUM_SCORE_RANGE_MAX,
    MEDIUM_SCORE_RANGE_MIN,
    MEDIUM_SCORE_THRESHOLD,
    PASS_ACTION_THRESHOLD,
    PRELIMINARY_WAIT_TIME,
} from '@app/constants/virtual-player-constants';
import { AbstractVirtualPlayer } from '@app/classes/virtual-player/abstract-virtual-player';
import { ActionExchange, ActionPass, ActionPlace } from '@app/classes/actions';
import { ActionData } from '@app/classes/communication/action-data';
import { Board } from '@app/classes/board';
import { Delay } from '@app/utils/delay';
import Range from '@app/classes/range/range';
import { ScoredWordPlacement, WordFindingRequest, WordFindingUseCase } from '@app/classes/word-finding';

export class BeginnerVirtualPlayer extends AbstractVirtualPlayer {
    async playTurn(): Promise<void> {
        const waitPreliminaryTime = async (): Promise<void> => {
            await Delay.for(PRELIMINARY_WAIT_TIME);
        };
        const waitFinalTime = async (): Promise<void> => {
            await Delay.for(FINAL_WAIT_TIME);
        };

        const play = async (): Promise<[ActionData, void]> => {
            return await Promise.all([this.findAction(), waitPreliminaryTime()]);
        };
        const actionResult: [ActionData, void] | void = await Promise.race([play(), waitFinalTime()]);
        this.getVirtualPlayerService().sendAction(this.gameId, this.id, actionResult ? actionResult[0] : ActionPass.createActionData());
    }

    findPointRange(): Range {
        const randomPointRange = Math.random();
        if (randomPointRange <= LOW_SCORE_THRESHOLD) {
            return new Range(LOW_SCORE_RANGE_MIN, LOW_SCORE_RANGE_MAX);
        } else if (randomPointRange <= MEDIUM_SCORE_THRESHOLD) {
            return new Range(MEDIUM_SCORE_RANGE_MIN, MEDIUM_SCORE_RANGE_MAX);
        } else {
            return new Range(HIGH_SCORE_RANGE_MIN, HIGH_SCORE_RANGE_MAX);
        }
    }

    generateWordFindingRequest(): WordFindingRequest {
        return {
            pointRange: this.findPointRange(),
            useCase: WordFindingUseCase.Beginner,
            pointHistory: this.pointHistory,
        };
    }

    async findAction(): Promise<ActionData> {
        const randomAction = Math.random();
        if (randomAction <= PASS_ACTION_THRESHOLD) {
            return ActionPass.createActionData();
        }
        if (randomAction <= EXCHANGE_ACTION_THRESHOLD) {
            return ActionExchange.createActionData(this.tiles);
        }
        const scoredWordPlacement = this.computeWordPlacement();
        if (scoredWordPlacement) {
            this.updateHistory(scoredWordPlacement);
            return ActionPlace.createActionData(scoredWordPlacement);
        }
        return ActionPass.createActionData();
    }

    updateHistory(scoredWordPlacement: ScoredWordPlacement): void {
        const scoreCount = this.pointHistory.get(scoredWordPlacement.score);
        this.pointHistory.set(scoredWordPlacement.score, scoreCount ? scoreCount + 1 : 1);
    }

    getGameBoard(gameId: string, playerId: string): Board {
        return this.getActiveGameService().getGame(gameId, playerId).board;
    }

    computeWordPlacement(): ScoredWordPlacement | undefined {
        return this.getWordFindingService().findWords(this.getGameBoard(this.gameId, this.id), this.tiles, this.generateWordFindingRequest()).pop();
    }
}
