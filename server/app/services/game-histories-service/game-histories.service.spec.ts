/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { GameHistory, PlayerHistoryData } from '@app/classes/database/game-history';
import { GameMode } from '@app/classes/game/game-mode';
import { GameType } from '@app/classes/game/game-type';
import DatabaseService from '@app/services/database-service/database.service';
import { DatabaseServiceMock } from '@app/services/database-service/database.service.mock.spec';
import GameHistoriesService from '@app/services/game-histories-service/game-histories.service';
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';
import { MongoClient } from 'mongodb';
// eslint-disable-next-line import/no-named-as-default
import Container from 'typedi';
chai.use(chaiAsPromised); // this allows us to test for rejection

const DEFAULT_WINNER_DATA: PlayerHistoryData = {
    name: 'Matildd Broussaux',
    score: 569,
    isVirtualPlayer: false,
    isWinner: true,
};

const DEFAULT_LOSER_DATA: PlayerHistoryData = {
    name: 'RaphaitLaVaisselle',
    score: 420,
    isVirtualPlayer: false,
    isWinner: false,
};

const DEFAULT_GAME_HISTORY: GameHistory = {
    startTime: new Date(),
    endTime: new Date(),
    player1Data: DEFAULT_WINNER_DATA,
    player2Data: DEFAULT_LOSER_DATA,
    gameType: GameType.Classic,
    gameMode: GameMode.Multiplayer,
    hasBeenAbandoned: false,
};

const OTHER_GAME_HISTORY: GameHistory = { ...DEFAULT_GAME_HISTORY, gameType: GameType.LOG2990, hasBeenAbandoned: true };

const INITIAL_GAME_HISTORIES: GameHistory[] = [{ ...DEFAULT_GAME_HISTORY }, { ...DEFAULT_GAME_HISTORY }, { ...DEFAULT_GAME_HISTORY }];

describe('GameHistoriesService', () => {
    let gameHistoriesService: GameHistoriesService;
    let databaseService: DatabaseService;
    let client: MongoClient;

    beforeEach(async () => {
        databaseService = Container.get(DatabaseServiceMock) as unknown as DatabaseService;
        client = (await databaseService.connectToServer()) as MongoClient;
        gameHistoriesService = Container.get(GameHistoriesService);
        gameHistoriesService['databaseService'] = databaseService;
        await gameHistoriesService['collection'].insertMany(INITIAL_GAME_HISTORIES);
    });

    afterEach(async () => {
        try {
            await databaseService.closeConnection();
        } catch (exception) {}
        chai.spy.restore();
    });

    describe('getAllGameHistories', () => {
        it('should get all gameHistories from DB', async () => {
            const gameHistories = await gameHistoriesService['getAllGameHistories']();
            expect(gameHistories.length).to.equal(INITIAL_GAME_HISTORIES.length);
            expect(INITIAL_GAME_HISTORIES).to.deep.equals(gameHistories);
        });
    });

    describe('addGameHistory', () => {
        it('should add one record to the collection', async () => {
            const initialLength: number = (await gameHistoriesService.getAllGameHistories()).length;
            await gameHistoriesService.addGameHistory(DEFAULT_GAME_HISTORY);
            const finalLength: number = (await gameHistoriesService.getAllGameHistories()).length;
            expect(finalLength).to.equal(initialLength + 1);
        });

        it('last gameHistory should be the one we just added', async () => {
            await gameHistoriesService.addGameHistory(OTHER_GAME_HISTORY);
            const gameHistories = await gameHistoriesService.getAllGameHistories();
            expect(gameHistories[gameHistories.length - 1]).to.deep.equal(OTHER_GAME_HISTORY);
        });
    });

    describe('resetGameHistories', () => {
        it('should delete all documents of the array', async () => {
            await gameHistoriesService.resetGameHistories();
            const gameHistories = await gameHistoriesService.getAllGameHistories();
            expect(gameHistories.length).to.equal(0);
        });
    });

    describe('Error handling', async () => {
        it('should throw an error if we try to access the database on a closed connection', async () => {
            await client.close();
            expect(gameHistoriesService['getAllGameHistories']()).to.eventually.be.rejectedWith(Error);
        });
    });
});
