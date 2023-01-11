import { GameHistoriesRequest } from '@app/classes/communication/request';
import { GameHistory } from '@app/classes/database/game-history';
import GameHistoriesService from '@app/services/game-history-service/game-history.service';
import { Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class GameHistoriesController {
    router: Router;

    constructor(private gameHistoriesService: GameHistoriesService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.get('/gameHistories', async (req: GameHistoriesRequest, res: Response, next) => {
            try {
                const gameHistories: GameHistory[] = await this.gameHistoriesService.getAllGameHistories();
                res.status(StatusCodes.OK).send({ gameHistories });
            } catch (exception) {
                next(exception);
            }
        });

        this.router.delete('/gameHistories', async (req: GameHistoriesRequest, res: Response, next) => {
            try {
                await this.handleGameHistoriesReset();
                res.status(StatusCodes.NO_CONTENT).send();
            } catch (exception) {
                next(exception);
            }
        });
    }

    private async handleGameHistoriesReset(): Promise<void> {
        await this.gameHistoriesService.resetGameHistories();
    }
}
