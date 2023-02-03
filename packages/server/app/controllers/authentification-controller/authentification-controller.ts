import { AuthentificationService } from '@app/services/authentification-service/authentification.service';
import { Service } from 'typedi';
import { BaseController } from '@app/controllers/base-controller';
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

@Service()
export class AuthentificationController extends BaseController {
    constructor(private readonly authentificationservice: AuthentificationService) {
        super('/api/authentification');
    }
    protected configure(router: Router): void {
        router.post('/login', async (req, res, next) => {
            try {
                this.authentificationservice.login(req.body).then((token) => res.send({ token }).status(StatusCodes.ACCEPTED).end());
            } catch (exception) {
                next(exception);
            }
        });

        router.post('/signUp', async (req, res, next) => {
            try {
                this.authentificationservice.signUp(req.body).then((token) => res.send({ token }).status(StatusCodes.ACCEPTED).end());
            } catch (exception) {
                next(exception);
            }
        });
    }
}
