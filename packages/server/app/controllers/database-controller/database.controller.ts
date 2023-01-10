import { Router } from 'express';
import { Service } from 'typedi';
import DatabaseService from '@app/services/database-service/database.service';
import { StatusCodes } from 'http-status-codes';

@Service()
export class DatabaseController {
    router: Router;

    constructor(private readonly databaseService: DatabaseService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.get('/is-connected', async (req, res) => {
            this.databaseService
                .connectToServer()
                .then((client) => (client ? res.status(StatusCodes.NO_CONTENT).send() : res.status(StatusCodes.INTERNAL_SERVER_ERROR).send()))
                .catch((error) => res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error));
        });
    }
}
