import { WordPlacement } from '@common/models/word-finding';
import { BaseController } from '@app/controllers/base-controller';
import { wordPlacementValidator } from '@app/middlewares/validators/word-placement';
import { PuzzleService } from '@app/services/puzzle-service/puzzle.service';
import { UserRequest } from '@app/types/user';
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';
import { Position } from '@app/classes/board';

@Service()
export class PuzzleController extends BaseController {
    constructor(private readonly puzzleService: PuzzleService) {
        super('/api/puzzles');
    }

    protected configure(router: Router): void {
        router.post('/start', (req: UserRequest, res, next) => {
            try {
                res.status(StatusCodes.OK).send(this.puzzleService.startPuzzle(req.body.idUser));
            } catch (e) {
                next(e);
            }
        });

        router.post('/complete', ...wordPlacementValidator('wordPlacement'), (req: UserRequest<{ wordPlacement: WordPlacement }>, res, next) => {
            try {
                res.status(StatusCodes.OK).send(
                    this.puzzleService.completePuzzle(req.body.idUser, {
                        ...req.body.wordPlacement,
                        startPosition: Position.fromJson(req.body.wordPlacement.startPosition),
                    }),
                );
            } catch (e) {
                next(e);
            }
        });

        router.post('/abandon', (req: UserRequest, res, next) => {
            try {
                res.status(StatusCodes.OK).send(this.puzzleService.abandonPuzzle(req.body.idUser));
            } catch (e) {
                next(e);
            }
        });
    }
}
