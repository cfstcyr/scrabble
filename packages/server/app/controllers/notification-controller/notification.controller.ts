import { TokenRequest } from '@app/classes/communication/request';
import { Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';
import { BaseController } from '@app/controllers/base-controller';
import { UserId } from '@app/classes/user/connected-user-types';
import { NotificationService } from '@app/services/notification-service/notification.service';

@Service()
export class NotificationController extends BaseController {
    constructor(private notificationService: NotificationService) {
        super('/api/notification');
    }

    protected configure(router: Router): void {
        router.post('/', async (req: TokenRequest, res: Response, next) => {
            const { firebaseToken }: { firebaseToken: string } = req.body;

            const userId: UserId = req.body.idUser;
            try {
                this.notificationService.addMobileUserToken(userId, firebaseToken);
                res.status(StatusCodes.NO_CONTENT).send();
            } catch (exception) {
                next(exception);
            }
        });
    }
}
