import { AuthentificationService } from '@app/services/authentification-service/authentification.service';
import { Service } from 'typedi';
import { BaseController } from '@app/controllers/base-controller';
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { HttpException } from '@app/classes/http-exception/http-exception';
import { NO_CRENTIALS, NO_LOGIN, NO_SIGNUP } from '@app/constants/controllers-errors';

@Service()
export class AuthentificationController extends BaseController {
    constructor(private readonly authentificationservice: AuthentificationService) {
        super('/api/authentification');
    }

    protected configure(router: Router): void {
        router.post('/login', async (req, res, next) => {
            this.authentificationservice
                .login(req.body)
                .then((token) => res.send({ token }).status(StatusCodes.OK).end())
                .catch(() => next(new HttpException(NO_LOGIN, StatusCodes.BAD_REQUEST)));
        });

        router.post('/signUp', async (req, res, next) => {
            this.authentificationservice
                .signUp(req.body)
                .then((token) => res.send({ token }).status(StatusCodes.CREATED).end())
                .catch(() => next(new HttpException(NO_SIGNUP, StatusCodes.FORBIDDEN)));
        });
    }
}
