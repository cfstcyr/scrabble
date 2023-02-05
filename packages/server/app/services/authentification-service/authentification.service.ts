import { TokenData } from '@app/classes/user/token-data';
import { SALTROUNDS } from '@app/constants/services-constants/bcrypt-saltrounds';
import DatabaseService from '@app/services/database-service/database.service';
import { env } from '@app/utils/environment/environment';
import { Credentials, User } from '@common/models/user';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { Service } from 'typedi';

@Service()
export class AuthentificationService {
    constructor(private databaseService: DatabaseService) { }

    async login(credentials: Credentials): Promise<string | void> {
        const user = await this.getUserByEmail(credentials.email);
        const match = await bcrypt.compare(credentials.password, user.password);
        if (match) return this.generateAccessToken(user.idUser);
    }

    async signUp(user: User): Promise<string> {
        const hash = await bcrypt.hash(user.password, SALTROUNDS);
        const data = await this.insertUser({ ...user, password: hash });

        return this.generateAccessToken(data.idUser);
    }

    async getUserByEmail(email: string): Promise<User> {
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

    private async insertUser(user: User): Promise<TokenData> {
        return new Promise((resolve, reject) => {
            this.table
                .returning('idUser')
                .insert(user)
                .then((data) => resolve(data[0] as unknown as TokenData))
                .catch((err) => reject(err));
        });
    }

    private get table() {
        return this.databaseService.knex<User>('User');
    }

    private generateAccessToken = (idUser: number): string => {
        return jwt.sign(idUser.toString(), env.TOKEN_SECRET);
    };
}
