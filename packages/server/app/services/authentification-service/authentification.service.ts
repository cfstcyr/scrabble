import DatabaseService from '@app/services/database-service/database.service';
import { Service } from 'typedi';

@Service()
export class AuthentificationService {
    constructor(private databaseService: DatabaseService) {}

}
