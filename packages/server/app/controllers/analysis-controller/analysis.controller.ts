import { GameRequest } from '@app/classes/communication/request';
import { Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';
import { BaseController } from '@app/controllers/base-controller';
import { UserId } from '@app/classes/user/connected-user-types';
import { AnalysisPersistenceService } from '@app/services/analysis-persistence-service/analysis-persistence.service';
import { AnalysisResponse } from '@common/models/analysis';
import { GameHistory } from '@common/models/game-history';
import { TypeOfId } from '@common/types/id';

@Service()
export class AnalysisController extends BaseController {
    constructor(private analysisPersistenceService: AnalysisPersistenceService) {
        super('/api/analysis');
    }

    protected configure(router: Router): void {
        router.get('/:idGameHistory', async (req: GameRequest, res: Response, next) => {
            const { idGameHistory } = req.params;
            const userId: UserId = req.body.idUser;

            try {
                const analysis = await this.handleRequestAnalysis(parseInt(idGameHistory, 10), userId);
                res.status(StatusCodes.OK).send({ analysis });
            } catch (exception) {
                next(exception);
            }
        });
    }

    private async handleRequestAnalysis(idGameHistory: TypeOfId<GameHistory>, userId: UserId): Promise<AnalysisResponse> {
        return await this.analysisPersistenceService.requestAnalysis(idGameHistory, userId);
    }
}
