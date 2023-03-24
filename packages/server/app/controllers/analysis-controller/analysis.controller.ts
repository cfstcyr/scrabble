import { GameRequest } from '@app/classes/communication/request';
import { Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';
import { BaseController } from '@app/controllers/base-controller';
import { UserId } from '@app/classes/user/connected-user-types';
import { AnalysisPersistenceService } from '@app/services/analysis-persistence-service/analysis-persistence.service';
import { AnalysisResponse } from '@app/classes/analysis/analysis';

@Service()
export class AnalysisController extends BaseController {
    constructor(private analysisPersistenceService: AnalysisPersistenceService) {
        super('/api/analysis');
    }

    protected configure(router: Router): void {
        router.get('/:gameId', async (req: GameRequest, res: Response, next) => {
            const { gameId } = req.params;
            const userId: UserId = req.body.idUser;

            try {
                const analysis = await this.handleRequestAnalysis(gameId, userId);
                res.status(StatusCodes.OK).send({ analysis });
            } catch (exception) {
                next(exception);
            }
        });
    }

    private async handleRequestAnalysis(gameId: string, userId: UserId): Promise<AnalysisResponse> {
        return await this.analysisPersistenceService.requestAnalysis(gameId, userId);
    }
}
