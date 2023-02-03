import User from '@app/classes/user/user';
import DatabaseService from '@app/services/database-service/database.service';
import { Service } from 'typedi';
import * as jwt from 'jsonwebtoken';
import { env } from '@app/utils/environment/environment';

@Service()
export class AuthentificationService {
    constructor(private databaseService: DatabaseService) { }

    async login(user: { email: string; password: string }): Promise<string> {
        const data = await this.databaseService.getUserId(user);

        return new Promise((resolve, reject) => {
            if (data) {
                const token = this.generateAccessToken(this.dataToUserId(data));
                resolve(token);
            } else reject();
        });
    }

    async signUp(user: User): Promise<string> {
        const data = await this.databaseService.createUser(user);

        return new Promise((resolve, reject) => {
            if (data) {
                const token = this.generateAccessToken(this.dataToUserId(data));
                resolve(token);
            } else reject();
        });
    }

    private generateAccessToken(userId: string): string {
        return jwt.sign(userId, env.TOKEN_SECRET, { expiresIn: '1800s' });
    }

    private dataToUserId(data: number[]): string {
        return data[0].toString();
    }

}
