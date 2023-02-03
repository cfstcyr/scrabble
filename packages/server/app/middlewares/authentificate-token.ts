import * as jwt from 'jsonwebtoken';
import { NextFunction, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AuthenticateTokenRequest } from '@app/classes/communication/request';
import { env } from '@app/utils/environment/environment';

export const authenticateToken = (req: AuthenticateTokenRequest, res: Response, next: NextFunction): Response => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(StatusCodes.UNAUTHORIZED);

    jwt.verify(token, env.TOKEN_SECRET, () => {
        next();

        return res.sendStatus(StatusCodes.ACCEPTED);
    });
    return res;
};
