import * as jwt from 'jsonwebtoken';
import { NextFunction, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AuthenticateTokenRequest } from '@app/classes/communication/request';

export const authenticateToken = (req: AuthenticateTokenRequest, res: Response, next: NextFunction): Response => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(StatusCodes.UNAUTHORIZED);

    jwt.verify(token, process.env.TOKEN_SECRET as string, (err, user) => {
        // eslint-disable-next-line no-console
        console.log(err);
        // eslint-disable-next-line no-console
        console.log(user);

        if (err) return res.sendStatus(StatusCodes.FORBIDDEN);

        next();
    });

    return res.sendStatus(StatusCodes.ACCEPTED);
};
