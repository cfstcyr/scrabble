import { Router } from 'express';
import { Service } from 'typedi';
import DatabaseService from '@app/services/database-service/database.service';
import { StatusCodes } from 'http-status-codes';
import { BaseController } from '../base-controller';

@Service()
export class DatabaseController extends BaseController {
    constructor(private readonly databaseService: DatabaseService) {
        super('/api/database');
    }

    protected configure(router: Router): void {
        router.get('/is-connected', async (req, res) => {
            this.databaseService
                .connectToServer()
                .then((client) => (client ? res.status(StatusCodes.NO_CONTENT).send() : res.status(StatusCodes.INTERNAL_SERVER_ERROR).send()))
                .catch((error) => res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error));
        });
    }
}
