import User from '@app/classes/user/user';
import DatabaseService from '@app/services/database-service/database.service';
import { Service } from 'typedi';
import * as jwt from 'jsonwebtoken';
import { env } from '@app/utils/environment/environment';

@Service()
export class AuthentificationService {
    constructor(private databaseService: DatabaseService) { }

    async login(user: User): Promise<User> {
        const data = await this.databaseService.getUser(user);

        return new Promise((resolve, reject) => {
            if (data) {
                resolve(data);
            } else reject();
        });
    }

    async signUp(user: User): Promise<number[]> {
        const userId = await this.databaseService.createUser(user);

        return new Promise((resolve, reject) => {
            if (userId) {
                resolve(userId);
            } else reject();
        });
    }

    private generateAccessToken(user: User) {
        return jwt.sign(user, env.TOKEN_SECRET, { expiresIn: '1800s' });
    }
}
