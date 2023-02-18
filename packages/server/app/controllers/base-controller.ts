import { authenticateToken } from '@app/middlewares/authentificate-token';
import { doesRequestComeFromVirtualPlayer } from '@app/utils/is-id-virtual-player/is-id-virtual-player';
import { Application, NextFunction, Request, Response, Router } from 'express';
import { Token } from 'typedi';

const PUBLIC_HTTP_REQUEST_URLS = ['/api/authentification', '/api/database'];

export const controllerToken = new Token<BaseController>('controllers');

export abstract class BaseController {
    private router: Router;
    private path: string;

    constructor(path: string) {
        this.router = Router();
        this.path = path;

        this.configure(this.router);
    }

    route(app: Application): void {
        app.use(this.path, this.router);
        app.use(applyMiddlewareUnless(PUBLIC_HTTP_REQUEST_URLS, authenticateToken));
    }

    protected abstract configure(router: Router): void;
}

const applyMiddlewareUnless = (urls: string[], middleware: (req: Request, res: Response, next: NextFunction) => void) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const url = req.url;

        if (doesRequestComeFromVirtualPlayer(url)) return next();
        if (urls.find((urlToFind) => url.startsWith(urlToFind))) return next();

        return middleware(req, res, next);
    };
};
