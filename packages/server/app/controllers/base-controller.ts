import * as express from 'express';
import { Token } from 'typedi';

export const controllerToken = new Token<BaseController>('controllers');

export abstract class BaseController {
    private router: express.Router;
    private path: string;

    constructor(path: string) {
        this.router = express.Router();
        this.path = path;

        this.configure(this.router);
    }

    route(app: express.Application): void {
        app.use(this.path, this.router);
    }

    protected abstract configure(router: express.Router): void;
}
