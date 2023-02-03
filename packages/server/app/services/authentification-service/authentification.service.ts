import User from '@app/classes/user/user';
import DatabaseService from '@app/services/database-service/database.service';
import { Service } from 'typedi';
import * as jwt from 'jsonwebtoken';
import { env } from '@app/utils/environment/environment';
import * as bcrypt from 'bcrypt';
import { SALTROUNDS } from '@app/constants/services-constants/bcrypt-saltrounds';
import TokenData from '@app/classes/user/token-data';

@Service()
export class AuthentificationService {
    constructor(private databaseService: DatabaseService) { }

    async login(credentials: { email: string; password: string }): Promise<string> {
        const id = await this.databaseService.getUserId(credentials.email);
        const user = await this.databaseService.getUser(id.idUser);
        const match = await bcrypt.compare(credentials.password, user.password);

        return new Promise((resolve, reject) => {
            if (match) {
                try {
                    const token = this.generateAccessToken(id.idUser);
                    resolve(token);
                } catch (err) {
                    reject(err);
                }
            }
        });
    }

    async signUp(user: User): Promise<string> {
        const hash = await bcrypt.hash(user.password, SALTROUNDS);
        const data = (await this.databaseService.createUser({ ...user, password: hash })) as TokenData;

        return new Promise((resolve, reject) => {
            try {
                const token = this.generateAccessToken(data.idUser);
                resolve(token);
            } catch (err) {
                reject(err);
            }
        });
    }

    private generateAccessToken = (idUser: number): string => {
        return jwt.sign(idUser.toString(), env.TOKEN_SECRET);
    };
}
