import * as jwt from 'jsonwebtoken';
import { NextFunction, Response, Request } from 'express';
import { StatusCodes } from 'http-status-codes';
import { env } from '@app/utils/environment/environment';
import { HttpException } from '@app/classes/http-exception/http-exception';

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token === undefined || token === null) {
        return next(new HttpException('No token was provided', StatusCodes.UNAUTHORIZED));
    }

    try {
        const idUser = jwt.verify(token, env.TOKEN_SECRET);
        req.body = { ...req.body, user: idUser };
        next();
    } catch (error) {
        next(new HttpException('Could not verify token', StatusCodes.UNAUTHORIZED));
    }
};
