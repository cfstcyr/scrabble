import { HighScoresRequest } from '@app/classes/communication/request';
import HighScoresService from '@app/services/high-score-service/high-score.service';
import { SocketService } from '@app/services/socket-service/socket.service';
import { Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';
import { BaseController } from '@app/controllers/base-controller';

@Service()
export class HighScoresController extends BaseController {
    constructor(private highScoresService: HighScoresService, private socketService: SocketService) {
        super('/api/highScores');
    }

    protected configure(router: Router): void {
        router.get('/:playerId', async (req: HighScoresRequest, res: Response, next) => {
            const { playerId } = req.params;

            try {
                await this.handleHighScoresRequest(playerId);
                res.status(StatusCodes.NO_CONTENT).send();
            } catch (exception) {
                next(exception);
            }
        });

        router.delete('/', async (req: HighScoresRequest, res: Response, next) => {
            try {
                await this.highScoresService.resetHighScores();
                res.status(StatusCodes.NO_CONTENT).send();
            } catch (exception) {
                next(exception);
            }
        });
    }

    private async handleHighScoresRequest(playerId: string): Promise<void> {
        const highScores = await this.highScoresService.getAllHighScore();
        this.socketService.emitToSocket(playerId, 'highScoresList', highScores);
    }
}
