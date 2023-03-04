import { BaseController } from '@app/controllers/base-controller';
import { EditableUserFields, UserRequest } from '@common/models/user';
import { UserService } from '@app/services/user-service/user-service';
import { Router } from 'express';
import { Service } from 'typedi';
import { StatusCodes } from 'http-status-codes';
import { UserStatisticsService } from '@app/services/user-statistics-service/user-statistics-service';

@Service()
export class UserController extends BaseController {
    constructor(private readonly userService: UserService, private readonly userStatisticsService: UserStatisticsService) {
        super('/api/user');
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
    }
}
