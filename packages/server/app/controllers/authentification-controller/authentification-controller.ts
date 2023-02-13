import { AuthentificationService } from '@app/services/authentification-service/authentification.service';
import { Service } from 'typedi';
import { BaseController } from '@app/controllers/base-controller';
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { HttpException } from '@app/classes/http-exception/http-exception';
import { NO_LOGIN, NO_SIGNUP, NO_VALIDATE } from '@app/constants/controllers-errors';
import { authenticateToken } from '@app/middlewares/authentificate-token';

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

        router.get('/validate', authenticateToken, async (req, res, next) => {
            try {
                const token = this.authentificationservice.generateAccessToken(req.body.user);
                res.send({ token }).status(StatusCodes.OK).end();
            } catch {
                next(new HttpException(NO_VALIDATE));
            }
        });

        router.post('/validateUsername', async (req, res, next) => {
            this.authentificationservice
                .validateUsername(req.body.username as string)
                .then((isAvailable) => res.send({ isAvailable }).status(StatusCodes.OK).end())
                .catch(() => next(new HttpException(NO_SIGNUP, StatusCodes.FORBIDDEN)));
        });

        router.post('/validateEmail', async (req, res, next) => {
            this.authentificationservice
                .validateEmail(req.body.email as string)
                .then((isAvailable) => res.send({ isAvailable }).status(StatusCodes.OK).end())
                .catch(() => next(new HttpException(NO_SIGNUP, StatusCodes.FORBIDDEN)));
        });
    }
}
