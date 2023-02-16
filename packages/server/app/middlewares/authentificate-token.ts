import { HttpException } from '@app/classes/http-exception/http-exception';
import { NO_TOKEN, TOKEN_IS_INVALID } from '@app/constants/controllers-errors';
import { env } from '@app/utils/environment/environment';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as jwt from 'jsonwebtoken';

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return next(new HttpException(NO_TOKEN, StatusCodes.NOT_ACCEPTABLE));
    }

    try {
        const idUser = Number(jwt.verify(token, env.TOKEN_SECRET));

        req.body = { ...req.body, idUser };
        next();
    } catch (error) {
        next(new HttpException(TOKEN_IS_INVALID, StatusCodes.NOT_ACCEPTABLE));
    }
};
