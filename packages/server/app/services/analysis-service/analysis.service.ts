import { CriticalMoment, PlayerAnalysis } from '@app/classes/analysis/analysis';
import Game from '@app/classes/game/game';
import { CompletedRound } from '@app/classes/round/round';
import Range from '@app/classes/range/range';
import { AbstractVirtualPlayer } from '@app/classes/virtual-player/abstract-virtual-player/abstract-virtual-player';
import { WordFindingUseCase, WordFindingRequest, ScoredWordPlacement } from '@app/classes/word-finding';
import { Service } from 'typedi';
import WordFindingService from '@app/services/word-finding-service/word-finding.service';
import { ActionPass, ActionPlace } from '@app/classes/actions';
import { ActionTurnEndingType } from '@app/classes/communication/action-data';
import { AnalysisPersistenceService } from '@app/services/analysis-persistence-service/analysis-persistence.service';

const POINT_DIFFERENCE_CRITICAL_MOMENT_THRESHOLD = 25;
@Service()
export class AnalysisService {
    // playerLeftEvent: EventEmitter;
    // private activeGames: Game[];
    private wordFindingRequest: WordFindingRequest = {
        pointRange: new Range(0, Number.MAX_SAFE_INTEGER),
        useCase: WordFindingUseCase.Expert,
        pointHistory: new Map<number, number>(),
    };

    constructor(private wordFindingService: WordFindingService, private analysisPersistenceService: AnalysisPersistenceService) {
        //
    }

    async addAnalysis(game: Game): Promise<void> {
        const completedRounds: CompletedRound[] = game.roundManager.completedRounds;
        const playerAnalyses: PlayerAnalysis[] = [];
        for (const player of game.getPlayerArray()) {
            if (player instanceof AbstractVirtualPlayer) continue;
            playerAnalyses.push({ player, analysis: { gameId: game.getId(), userId: player.idUser, criticalMoments: [] } });
        }

        for (const playerAnalysis of playerAnalyses) {
            for (const round of completedRounds) {
                if (round.player === playerAnalysis.player) {
                    const criticalMoment = this.analyseRound(round, game);
                    if (criticalMoment) playerAnalysis.analysis.criticalMoments.push(criticalMoment);
                }
            }
            await this.analysisPersistenceService.addAnalysis(game.getId(), playerAnalysis.analysis.userId, playerAnalysis.analysis);
        }
        for (const playerAnalysis of playerAnalyses) {
            await this.analysisPersistenceService.requestAnalysis(playerAnalysis.analysis.gameId, playerAnalysis.analysis.userId);
        }
    }

    analyseRound(round: CompletedRound, game: Game): CriticalMoment | undefined {
        const playedAction = round.actionPlayed;

        const bestPlacement = this.findBestPlacement(round, game.dictionarySummary.id);
        if (!bestPlacement) return;

        if (!(playedAction instanceof ActionPlace)) {
            if (!(bestPlacement.score > POINT_DIFFERENCE_CRITICAL_MOMENT_THRESHOLD)) return;
            const actionType = playedAction instanceof ActionPass ? ActionTurnEndingType.PASS : ActionTurnEndingType.EXCHANGE;

            return { tiles: round.tiles, actionType, board: round.board, bestPlacement };
        }
        return bestPlacement.score - playedAction.scoredPoints > POINT_DIFFERENCE_CRITICAL_MOMENT_THRESHOLD
            ? {
                  tiles: round.tiles,
                  actionType: ActionTurnEndingType.PLACE,
                  playedPlacement: { ...playedAction.wordPlacement, score: playedAction.scoredPoints },
                  board: round.board,
                  bestPlacement,
              }
            : undefined;
    }

    findBestPlacement(round: CompletedRound, dictionaryId: string): ScoredWordPlacement | undefined {
        const wordFindingInstance = this.wordFindingService.getWordFindingInstance(this.wordFindingRequest.useCase, dictionaryId, [
            round.board,
            round.player.tiles,
            this.wordFindingRequest,
        ]);
        return wordFindingInstance.findWords().pop();
    }
}
