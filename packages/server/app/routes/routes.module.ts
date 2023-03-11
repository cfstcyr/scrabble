import {
    AuthentificationController,
    DatabaseController,
    GameDispatcherController,
    GameHistoriesController,
    GamePlayController,
} from '@app/controllers';
import { BaseController } from '@app/controllers/base-controller';
import { ServerActionController } from '@app/controllers/server-action-controller/server-action.controller';
import { UserController } from '@app/controllers/user-controller/user-controller';

export type ClassType<T> = new (...args: unknown[]) => T;

export const PUBLIC_CONTROLLERS: ClassType<BaseController>[] = [AuthentificationController, DatabaseController];
export const PRIVATE_CONTROLLERS: ClassType<BaseController>[] = [
    GameDispatcherController,
    GamePlayController,
    GameHistoriesController,
    UserController,
    ServerActionController,
];
