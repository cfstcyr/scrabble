import { TokenRequest } from '@app/classes/communication/request';
import { UserId } from '@app/classes/user/connected-user-types';
import { BaseController } from '@app/controllers/base-controller';
import { NotificationService } from '@app/services/notification-service/notification.service';
import { UserService } from '@app/services/user-service/user-service';
import { User } from '@common/models/user';
import { Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class NotificationController extends BaseController {
    constructor(private notificationService: NotificationService, private userService: UserService) {
        super('/api/notification');
    }

    protected configure(router: Router): void {
        router.post('/', async (req: TokenRequest, res: Response, next) => {
            const firebaseToken: string = req.body.firebaseToken;
            const userId: UserId = req.body.idUser;
            const user: User = await this.userService.getUserById(userId);
            try {
                this.notificationService.addMobileUserToken(user, firebaseToken);
                res.status(StatusCodes.NO_CONTENT).send();
            } catch (exception) {
                next(exception);
            }
        });
    }
}
