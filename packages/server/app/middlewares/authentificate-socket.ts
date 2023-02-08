import { NextFunction } from 'express';
import * as io from 'socket.io';
import { Socket } from 'socket.io-client';
import * as jwt from 'jsonwebtoken';
import { env } from '@app/utils/environment/environment';

io.use(async (socket: Socket, next: NextFunction): io. => {
    const auth = socket.auth as { token: string };
    if (auth) {
        try {
            const userId = jwt.verify(auth.token, env.TOKEN_SECRET);

            // Get UserId form DB
            // Do double Connection Verrification on Users Set
            return next();
        } catch (err) {
            return next(new Error(err));
        }
    } else {
        next(new Error('Token is missing'));
    }
});
