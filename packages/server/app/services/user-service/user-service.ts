import { Service } from 'typedi';
import DatabaseService from '@app/services/database-service/database.service';
import { EditableUserFields, PublicUser, User } from '@common/models/user';
import { USER_TABLE } from '@app/constants/services-constants/database-const';
import { TypeOfId } from '@common/types/id';

@Service()
export class UserService {
    constructor(private readonly databaseService: DatabaseService) {}

    userToPublicUser(user: User): PublicUser {
        return {
            username: user.username,
            avatar: user.avatar,
            email: user.email,
        };
    }

    async editUser(idUser: TypeOfId<User>, fields: EditableUserFields): Promise<void> {
        const fieldsToUpdate: EditableUserFields = {};

        // We pick each fields individually to make sure the client doesn't send invalid fields.
        if (fields.avatar) fieldsToUpdate.avatar = fields.avatar;
        if (fields.username) fieldsToUpdate.username = fields.username;

        await this.table.where({ idUser }).update(fieldsToUpdate);
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

    async getUserById(idUser: TypeOfId<User>): Promise<User> {
        return new Promise((resolve, reject) => {
            this.table
                .where('idUser', idUser)
                .select('*')
                .then((data) => resolve(data[0]))
                .catch((err) => reject(err));
        });
    }

    async getPublicUserById(idUser: TypeOfId<User>): Promise<PublicUser> {
        return this.userToPublicUser(await this.getUserById(idUser));
    }

    private get table() {
        return this.databaseService.knex<User>(USER_TABLE);
    }
}
