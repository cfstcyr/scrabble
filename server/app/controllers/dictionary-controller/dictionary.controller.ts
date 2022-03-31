import { DictionaryRequest } from '@app/classes/communication/request';
import { DictionaryData } from '@app/classes/dictionary';
import { DictionarySummary, DictionaryUpdateInfo } from '@app/classes/dictionary/dictionary-data';
import { HttpException } from '@app/classes/http-exception/http-exception';
import DictionaryService from '@app/services/dictionary-service/dictionary.service';
import { Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class DictionaryController {
    router: Router;

    constructor(private dictionaryService: DictionaryService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.post('/dictionary', async (req: DictionaryRequest, res: Response) => {
            const body: DictionaryData = req.body;

            try {
                await this.dictionaryService.addNewDictionary(body);
                res.status(StatusCodes.CREATED).send();
            } catch (exception) {
                HttpException.sendError(exception, res);
            }
        });

        this.router.patch('/dictionary', async (req: DictionaryRequest, res: Response) => {
            const body: DictionaryUpdateInfo = req.body;

            try {
                await this.dictionaryService.updateDictionary(body);
                res.status(StatusCodes.OK).send();
            } catch (exception) {
                HttpException.sendError(exception, res);
            }
        });

        this.router.delete('/dictionary', async (req: DictionaryRequest, res: Response) => {
            const body: string = req.body;

            try {
                await this.dictionaryService.deleteDictionary(body);
                res.status(StatusCodes.OK).send();
            } catch (exception) {
                HttpException.sendError(exception, res);
            }
        });

        this.router.get('/dictionary/summary', async (req: DictionaryRequest, res: Response) => {
            try {
                const dictionarySummaries: DictionarySummary[] = await this.dictionaryService.getDictionarySummaryTitles();
                res.status(StatusCodes.OK).send(dictionarySummaries);
            } catch (exception) {
                HttpException.sendError(exception, res);
            }
        });

        this.router.get('/dictionary', async (req: DictionaryRequest, res: Response) => {
            const body: string = req.body;

            try {
                const dictionaryData: DictionaryData = await this.dictionaryService.getDbDictionary(body);
                res.status(StatusCodes.OK).send({
                    title: dictionaryData.title,
                    description: dictionaryData.description,
                    words: dictionaryData.words,
                });
            } catch (exception) {
                HttpException.sendError(exception, res);
            }
        });

        this.router.delete('/dictionary/reset', async (req: DictionaryRequest, res: Response) => {
            try {
                await this.dictionaryService.resetDbDictionaries();
                res.status(StatusCodes.OK).send();
            } catch (exception) {
                HttpException.sendError(exception, res);
            }
        });
    }
}
