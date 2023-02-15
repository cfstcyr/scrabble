import { HttpException } from '@app/classes/http-exception/http-exception';
import { ConnectedUser } from '@app/classes/user/connected-user';
import { TokenData } from '@app/classes/user/token-data';
import { ALREADY_LOGGED, NO_LOGIN, NO_VALIDATE } from '@app/constants/controllers-errors';
import { SALTROUNDS } from '@app/constants/services-constants/bcrypt-saltrounds';
import DatabaseService from '@app/services/database-service/database.service';
import { env } from '@app/utils/environment/environment';
import { PublicUser, UserDatabase, UserLoginCredentials, UserSession } from '@common/models/user';
import * as bcryptjs from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';
import * as jwt from 'jsonwebtoken';
import { Socket } from 'socket.io';
import { Service } from 'typedi';

@Service()
export class AuthentificationService {
    connectedUsers: ConnectedUser;

    constructor(private databaseService: DatabaseService) {
        this.connectedUsers = new ConnectedUser();
    }

    generateAccessToken = (idUser: number): string => {
        return jwt.sign(idUser.toString(), env.TOKEN_SECRET);
    };

    async authentificateSocket(socket: Socket, token: string): Promise<void> {
        const idUser = Number(jwt.verify(token, env.TOKEN_SECRET));

        if (this.connectedUsers.isConnected(idUser)) throw new Error(ALREADY_LOGGED);

        this.connectedUsers.connect(socket.id, idUser);

        socket.data.user = await this.getUserById(idUser);
    }

    disconnectSocket(socketId: string): void {
        this.connectedUsers.disconnect(socketId);
    }

    async login(credentials: UserLoginCredentials): Promise<UserSession> {
        const user = await this.getUserByEmail(credentials.email);

        if (this.connectedUsers.isConnected(user.idUser)) throw new HttpException(ALREADY_LOGGED, StatusCodes.UNAUTHORIZED);

        const match = await bcryptjs.compare(credentials.password, user.password);
        if (match) {
            const token = this.generateAccessToken(user.idUser);
            return { token, user: { email: user.email, username: user.username, avatar: user.avatar } };
        }
        throw new Error(NO_LOGIN);
    }

    async signUp(user: UserDatabase): Promise<UserSession> {
        const hash = await bcryptjs.hash(user.password, SALTROUNDS);
        const data = await this.insertUser({ ...user, password: hash });
        const token = this.generateAccessToken(data.idUser);

        return { token, user: { email: user.email, username: user.username, avatar: user.avatar } };
    }

    async validate(idUser: number): Promise<UserSession> {
        if (this.connectedUsers.isConnected(idUser)) throw new HttpException(ALREADY_LOGGED, StatusCodes.UNAUTHORIZED);

        let token;

        try {
            token = this.generateAccessToken(idUser);
        } catch (e) {
            throw new HttpException(NO_VALIDATE);
        }
        const user = await this.getUserById(idUser);

        return { token, user };
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

    async getUserById(idUser: number): Promise<PublicUser> {
        return new Promise((resolve, reject) => {
            this.table
                .where('idUser', idUser)
                .select('username', 'email', 'avatar')
                .then((data) => resolve(data[0]))
                .catch((err) => reject(err));
        });
    }

    async validateUsername(username: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.table
                .where('username', username)
                .select('*')
                .then((data) => resolve(data.length === 0))
                .catch((err) => reject(err));
        });
    }

    async validateEmail(email: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.table
                .where('email', email)
                .select('*')
                .then((data) => resolve(data.length === 0))
                .catch((err) => reject(err));
        });
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
        return this.databaseService.knex<UserDatabase>('User');
    }
}
