import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export class HttpException extends Error {
    constructor(message: string, public status: number = StatusCodes.INTERNAL_SERVER_ERROR) {
        super(message);
        this.name = 'HttpException';
    }

    static sendError(error: Error, response: Response): void {
        const message = error.message;
        let status = StatusCodes.INTERNAL_SERVER_ERROR;

        if (error instanceof HttpException) {
            status = error.status;
        }

        response.status(status).send({ message, status });
    }
}
