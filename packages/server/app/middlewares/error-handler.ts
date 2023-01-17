import { HttpException } from '@app/classes/http-exception/http-exception';
import { env } from '@app/utils/environment/environment';
import * as express from 'express';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';

interface ErrorResponse {
    message: string;
    error: string;
    stack?: string[];
}

// eslint-disable-next-line no-unused-vars
export const errorHandler = (error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    const status = error instanceof HttpException ? error.status : StatusCodes.INTERNAL_SERVER_ERROR;

    const response: ErrorResponse = {
        message: error.message,
        error: getReasonPhrase(status),
    };

    res.locals.message = error.message;
    res.locals.error = env.isDev ? error : {};

    if (env.isDev) {
        response.stack = error.stack?.split('\n');
    }

    if (!env.isProd) {
        // eslint-disable-next-line no-console
        console.error(error);
    }

    res.status(status).json(response);
};
