import User from '@app/classes/user/user';
import DatabaseService from '@app/services/database-service/database.service';
import { Service } from 'typedi';

@Service()
export class AuthentificationService {
    constructor(private databaseService: DatabaseService) { }

    login(user: User): void {
        this.databaseService.getUser(user);
    }
    signUp(user: User): void {
        this.databaseService.createUser(user);
    }
    createToken(user: User) {

    }
}
