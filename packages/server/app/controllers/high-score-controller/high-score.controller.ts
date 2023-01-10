import { HighScoresRequest } from '@app/classes/communication/request';
import { HttpException } from '@app/classes/http-exception/http-exception';
import HighScoresService from '@app/services/high-score-service/high-score.service';
import { SocketService } from '@app/services/socket-service/socket.service';
import { Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class HighScoresController {
    router: Router;

    constructor(private highScoresService: HighScoresService, private socketService: SocketService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.get('/highScores/:playerId', async (req: HighScoresRequest, res: Response) => {
            const { playerId } = req.params;
            try {
                await this.handleHighScoresRequest(playerId);
                res.status(StatusCodes.NO_CONTENT).send();
            } catch (exception) {
                HttpException.sendError(exception, res);
            }
        });

        this.router.delete('/highScores', async (req: HighScoresRequest, res: Response) => {
            try {
                await this.highScoresService.resetHighScores();
                res.status(StatusCodes.NO_CONTENT).send();
            } catch (exception) {
                HttpException.sendError(exception, res);
            }
        });
    }

    private async handleHighScoresRequest(playerId: string): Promise<void> {
        const highScores = await this.highScoresService.getAllHighScores();
        this.socketService.emitToSocket(playerId, 'highScoresList', highScores);
    }
}
