import { HttpException } from '@app/classes/http-exception/http-exception';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as express from 'express';
import { StatusCodes } from 'http-status-codes';
import * as logger from 'morgan';
import { join } from 'path';
import { Service } from 'typedi';
import { errorHandler } from './middlewares/error-handler';
import {
    DatabaseController,
    DictionaryController,
    GameDispatcherController,
    GameHistoriesController,
    GamePlayController,
    HighScoresController,
    VirtualPlayerProfilesController,
} from './controllers';

@Service()
export class Application {
    app: express.Application;

    constructor(
        private readonly databaseController: DatabaseController,
        private readonly dictionaryController: DictionaryController,
        private readonly gameDispatcherController: GameDispatcherController,
        private readonly gameHistoryController: GameHistoriesController,
        private readonly gamePlayController: GamePlayController,
        private readonly highScoreController: HighScoresController,
        private readonly virtualPlayerProfileController: VirtualPlayerProfilesController,
    ) {
        this.app = express();

        this.config();

        this.setPublicDirectory();

        this.bindRoutes();
    }

    bindRoutes(): void {
        this.databaseController.route(this.app);
        this.dictionaryController.route(this.app);
        this.gameDispatcherController.route(this.app);
        this.gameHistoryController.route(this.app);
        this.gamePlayController.route(this.app);
        this.highScoreController.route(this.app);
        this.virtualPlayerProfileController.route(this.app);

        this.errorHandling();
    }

    private config(): void {
        // Middlewares configuration
        this.app.use(logger('dev'));
        this.app.use(express.json({ limit: '10MB' }));
        this.app.use(express.urlencoded({ limit: '10MB', parameterLimit: 100000, extended: true }));
        this.app.use(cookieParser());
        this.app.use(cors());
    }

    private setPublicDirectory(): void {
        const path = join(__dirname, '../public');
        this.app.use('/public', express.static(path));
    }

    private errorHandling(): void {
        this.app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
            next(new HttpException(`Cannot ${req.method} ${req.path}`, StatusCodes.NOT_FOUND));
        });

        this.app.use(errorHandler);
    }
}
