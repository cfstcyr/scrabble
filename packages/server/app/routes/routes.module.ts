import {
    AuthentificationController,
    DatabaseController,
    DictionaryController,
    GameDispatcherController,
    GameHistoriesController,
    GamePlayController,
    HighScoresController,
    VirtualPlayerProfilesController,
} from '@app/controllers';

// eslint-disable-next-line @typescript-eslint/ban-types
export type ClassType<T> = Function & { prototype: T };

export const PUBLIC_CONTROLLERS: ClassType<unknown>[] = [AuthentificationController, DatabaseController];
export const PRIVATE_CONTROLLERS: ClassType<unknown>[] = [
    DictionaryController,
    GameDispatcherController,
    GamePlayController,
    GameHistoriesController,
    HighScoresController,
    VirtualPlayerProfilesController,
];
