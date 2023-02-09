import { HttpException } from '@app/classes/http-exception/http-exception';
import { TokenData } from '@app/classes/user/token-data';
import { SALTROUNDS } from '@app/constants/services-constants/bcrypt-saltrounds';
import { USER_TABLE } from '@app/constants/services-constants/database-const';
import { NO_TOKEN, TOKEN_INVALID } from '@app/constants/services-errors';
import DatabaseService from '@app/services/database-service/database.service';
import { env } from '@app/utils/environment/environment';
import { User, UserDatabase, UserLoginCredentials } from '@common/models/user';
import * as bcryptjs from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';
import * as jwt from 'jsonwebtoken';
import { Socket } from 'socket.io';
import { Service } from 'typedi';

@Service()
export class AuthentificationService {
    constructor(private databaseService: DatabaseService) {}

    async login(credentials: UserLoginCredentials): Promise<string | void> {
        const user = await this.getUserByEmail(credentials.email);
        const match = await bcryptjs.compare(credentials.password, user.password);
        if (match) return this.generateAccessToken(user.idUser);
    }

    async signUp(user: UserDatabase): Promise<string> {
        const hash = await bcryptjs.hash(user.password, SALTROUNDS);
        const data = await this.insertUser({ ...user, password: hash });

        return this.generateAccessToken(data.idUser);
    }

    async getUserByEmail(email: string): Promise<UserDatabase> {
        return new Promise((resolve, reject) => {
            this.table
                .where('email', email)
                .select('*')
                .then((data) => resolve(data[0]))
                .catch((err) => reject(err));
        });
    }

    // eslint-disable-next-line no-unused-vars
    async getUserFromToken(token: string): Promise<User | undefined> {
        return undefined;
    }

    async authenticateSocket(socket: Socket): Promise<User> {
        const token = socket.handshake.auth.token;

        if (!token) throw new HttpException(NO_TOKEN, StatusCodes.UNAUTHORIZED);

        const user = await this.getUserFromToken(socket.handshake.auth.token);

        if (!user) throw new HttpException(TOKEN_INVALID, StatusCodes.UNAUTHORIZED);

        return user;
    }

    private async insertUser(user: UserDatabase): Promise<TokenData> {
        return new Promise((resolve, reject) => {
            this.table
                .returning('idUser')
                .insert(user)
                .then((data) => resolve(data[0] as unknown as TokenData))
                .catch((err) => reject(err));
        });
    }

    private get table() {
        return this.databaseService.knex<UserDatabase>(USER_TABLE);
    }

    private generateAccessToken = (idUser: number): string => {
        return jwt.sign(idUser.toString(), env.TOKEN_SECRET);
    };
}
