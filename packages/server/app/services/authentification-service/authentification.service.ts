import { TokenData } from '@app/classes/user/token-data';
import { ALREADY_LOGGED, NO_LOGIN } from '@app/constants/controllers-errors';
import { SALTROUNDS } from '@app/constants/services-constants/bcrypt-saltrounds';
import DatabaseService from '@app/services/database-service/database.service';
import { env } from '@app/utils/environment/environment';
import { UserDatabase, UserLoginCredentials } from '@common/models/user';
import * as bcryptjs from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { Service } from 'typedi';

@Service()
export class AuthentificationService {
    connectedUsersMap: Map<string, number>;

    constructor(private databaseService: DatabaseService) {
        this.connectedUsersMap = new Map();
    }

    async authentificateSocket(socketId: string, token: string): Promise<void> {
        const idUser = jwt.verify(token, env.TOKEN_SECRET) as TokenData;

        this.connectedUsersMap.forEach((value) => {
            if (value === idUser.idUser) throw new Error(ALREADY_LOGGED);
        });

        this.connectedUsersMap.set(socketId, idUser.idUser);
    }

    async disconnectSocket(socketId: string): Promise<void> {
        this.connectedUsersMap.delete(socketId);
    }

    // authentificateSocket(socketId: string, token: string): void {
    //     jwt.verify(token, env.TOKEN_SECRET);

    //     if (this.map.has(token) && this.map.get(token) !== socketId) throw new Error(ALREADY_LOGGED);

    //     this.map.set(token, socketId);
    // // }

    async login(credentials: UserLoginCredentials): Promise<string | void> {
        const user = await this.getUserByEmail(credentials.email);
        const match = await bcryptjs.compare(credentials.password, user.password);
        if (match) return this.generateAccessToken(user.idUser);
        throw new Error(NO_LOGIN);
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

    private generateAccessToken = (idUser: number): string => {
        return jwt.sign(idUser.toString(), env.TOKEN_SECRET);
    };
}
