import TokenData from '@app/classes/user/token-data';
import { SALTROUNDS } from '@app/constants/services-constants/bcrypt-saltrounds';
import DatabaseService from '@app/services/database-service/database.service';
import { env } from '@app/utils/environment/environment';
import { Credentials, User } from '@common/models/user';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { Service } from 'typedi';

@Service()
export class AuthentificationService {
    constructor(private databaseService: DatabaseService) {}

    async login(credentials: Credentials): Promise<string | void> {
        const user = await this.getUserByEmail(credentials.email);
        const match = await bcrypt.compare(credentials.password, user.password);
        if (match) {
            return this.generateAccessToken(user.idUser);
        }
    }

    async signUp(user: User): Promise<string> {
        const hash = await bcrypt.hash(user.password, SALTROUNDS);
        const data = (await this.insertUser({ ...user, password: hash })) as TokenData;

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

    private async insertUser(user: User): Promise<{ idUser: number } | number> {
        return new Promise((resolve, reject) => {
            this.table
                .returning('idUser')
                .insert(user)
                .onConflict('email')
                .ignore()
                .onConflict('username')
                .ignore()
                .then((data) => resolve(data[0]))
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
