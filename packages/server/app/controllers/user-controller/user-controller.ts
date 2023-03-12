import { BaseController } from '@app/controllers/base-controller';
import { EditableUserFields } from '@common/models/user';
import { UserService } from '@app/services/user-service/user-service';
import { Router } from 'express';
import { Service } from 'typedi';
import { StatusCodes } from 'http-status-codes';
import { UserStatisticsService } from '@app/services/user-statistics-service/user-statistics-service';
import { UserRequest } from '@app/types/user';
import { HttpException } from '@app/classes/http-exception/http-exception';
import { SEARCH_QUERY_IS_REQUIRED } from '@app/constants/controllers-errors';

@Service()
export class UserController extends BaseController {
    constructor(private readonly userService: UserService, private readonly userStatisticsService: UserStatisticsService) {
        super('/api/users');
    }

    protected configure(router: Router): void {
        router.get('/', async (req: UserRequest, res, next) => {
            try {
                res.status(StatusCodes.OK).json(await this.userService.getPublicUserById(req.body.idUser));
            } catch (e) {
                next(e);
            }
        });

        router.patch('/', async (req: UserRequest<EditableUserFields>, res, next) => {
            try {
                await this.userService.editUser(req.body.idUser, req.body);
                res.status(StatusCodes.OK).json(await this.userService.getPublicUserById(req.body.idUser));
            } catch (e) {
                next(e);
            }
        });

        router.get('/statistics', async (req: UserRequest, res, next) => {
            try {
                res.status(StatusCodes.OK).json(await this.userStatisticsService.getStatistics(req.body.idUser));
            } catch (e) {
                next(e);
            }
        });

        router.get('/search', async (req: UserRequest, res, next) => {
            try {
                const query: string | undefined = req.query.q as string | undefined;

                if (query === undefined) throw new HttpException(SEARCH_QUERY_IS_REQUIRED, StatusCodes.NOT_ACCEPTABLE);

                res.status(StatusCodes.OK).json(await this.userService.search(query, req.body.idUser));
            } catch (e) {
                next(e);
            }
        });
    }
}
