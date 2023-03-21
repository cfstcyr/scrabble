/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Application } from '@app/app';
import { PuzzleService } from '@app/services/puzzle-service/puzzle.service';
import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
import { expect } from 'chai';
import { StatusCodes } from 'http-status-codes';
import { SinonStubbedInstance } from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';
import { PuzzleController } from './puzzle-controller';

const DEFAULT_ID_USER = 1;

describe('PuzzleController', () => {
    let expressApp: Express.Application;
    let controller: PuzzleController;
    let puzzleServiceStub: SinonStubbedInstance<PuzzleService>;
    let testingUnit: ServicesTestingUnit;

    beforeEach(async () => {
        testingUnit = new ServicesTestingUnit().withStubbedDictionaryService().withMockedAuthentification();
        await testingUnit.withMockDatabaseService();
        puzzleServiceStub = testingUnit.setStubbed(PuzzleService);
        expressApp = Container.get(Application).app;
        controller = Container.get(PuzzleController);
    });

    afterEach(() => {
        testingUnit.restore();
    });

    it('should create', () => {
        expect(controller).to.exist;
    });

    describe('/api/puzzles/start', () => {
        describe('POST', () => {
            it('should return 200', async () => {
                return supertest(expressApp).post('/api/puzzles/start').send({ idUser: DEFAULT_ID_USER }).expect(StatusCodes.OK);
            });

            it('should call startPuzzle', async () => {
                await supertest(expressApp).post('/api/puzzles/start').send({ idUser: DEFAULT_ID_USER });
                expect(puzzleServiceStub.startPuzzle.called).to.be.true;
            });
        });
    });

    describe('/api/puzzles/complete', () => {
        describe('POST', () => {
            it('should return 200', async () => {
                return supertest(expressApp).post('/api/puzzles/complete').send({ idUser: DEFAULT_ID_USER }).expect(StatusCodes.OK);
            });

            it('should call completePuzzle', async () => {
                await supertest(expressApp).post('/api/puzzles/complete').send({ idUser: DEFAULT_ID_USER });
                expect(puzzleServiceStub.completePuzzle.called).to.be.true;
            });
        });
    });
});
