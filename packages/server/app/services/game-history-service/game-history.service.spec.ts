/* eslint-disable dot-notation */
// /* eslint-disable no-empty */
// /* eslint-disable @typescript-eslint/no-empty-function */
// /* eslint-disable dot-notation */
// /* eslint-disable no-unused-expressions */
// /* eslint-disable @typescript-eslint/no-unused-expressions */
// import { GameMode } from '@app/classes/game/game-mode';
// import { GameType } from '@app/classes/game/game-type';
// import { GameHistoryPlayer, NoIdGameHistoryWithPlayers } from '@app/schemas/game-history';
// import { NoId } from '@app/schemas/schema';
// import DatabaseService from '@app/services/database-service/database.service';
// import GameHistoriesService from '@app/services/game-history-service/game-history.service';
// import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
// import * as chai from 'chai';
// import { expect } from 'chai';
// import * as chaiAsPromised from 'chai-as-promised';
// import { describe } from 'mocha';
// import { MongoClient } from 'mongodb';
// import { Container } from 'typedi';
// chai.use(chaiAsPromised); // this allows us to test for rejection

import { expect } from 'chai';
import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
import GameHistoriesService from './game-history.service';
import { GameHistoryPlayer, NoIdGameHistoryWithPlayers } from '@app/schemas/game-history';
import { NoId } from '@app/schemas/schema';
import { Container } from 'typedi';

// const DEFAULT_WINNER_DATA: NoId<GameHistoryPlayer, 'playerIndex' | 'gameHistoryId'> = {
//     name: 'Matildd Broussaux',
//     score: 569,
//     isVirtualPlayer: false,
//     isWinner: true,
// };

// const DEFAULT_LOSER_DATA: NoId<GameHistoryPlayer, 'playerIndex' | 'gameHistoryId'> = {
//     name: 'RaphaitLaVaisselle',
//     score: 420,
//     isVirtualPlayer: false,
//     isWinner: false,
// };

// const DEFAULT_GAME_HISTORY: NoIdGameHistoryWithPlayers = {
//     startTime: new Date(),
//     endTime: new Date(),
//     playersData: [DEFAULT_WINNER_DATA, DEFAULT_LOSER_DATA],
//     gameType: GameType.Classic,
//     gameMode: GameMode.Multiplayer,
//     hasBeenAbandoned: false,
// };

// const OTHER_GAME_HISTORY: NoIdGameHistoryWithPlayers = { ...DEFAULT_GAME_HISTORY, gameType: GameType.LOG2990, hasBeenAbandoned: true };

// const INITIAL_GAME_HISTORIES: NoIdGameHistoryWithPlayers[] =
//      [{ ...DEFAULT_GAME_HISTORY }, { ...DEFAULT_GAME_HISTORY }, { ...DEFAULT_GAME_HISTORY }];

// describe('GameHistoriesService', () => {
//     let gameHistoriesService: GameHistoriesService;
//     let databaseService: DatabaseService;
//     let client: MongoClient;
//     let testingUnit: ServicesTestingUnit;

//     beforeEach(() => {
//         testingUnit = new ServicesTestingUnit().withMockDatabaseService();
//     });

//     beforeEach(async () => {
//         databaseService = Container.get(DatabaseService);
//         client = (await databaseService.connectToServer()) as MongoClient;
//         gameHistoriesService = Container.get(GameHistoriesService);
//         await gameHistoriesService['collection'].insertMany(INITIAL_GAME_HISTORIES);
//     });

//     afterEach(async () => {
//         try {
//             await databaseService.closeConnection();
//         } catch (exception) {}
//         chai.spy.restore();

//         testingUnit.restore();
//     });

//     describe('getAllGameHistories', () => {
//         it('should get all gameHistories from DB', async () => {
//             const gameHistories = await gameHistoriesService['getAllGameHistories']();
//             expect(gameHistories.length).to.equal(INITIAL_GAME_HISTORIES.length);
//             expect(INITIAL_GAME_HISTORIES).to.deep.equals(gameHistories);
//         });
//     });

//     describe('addGameHistory', () => {
//         it('should add one record to the collection', async () => {
//             const initialLength: number = (await gameHistoriesService.getAllGameHistories()).length;
//             await gameHistoriesService.addGameHistory(DEFAULT_GAME_HISTORY);
//             const finalLength: number = (await gameHistoriesService.getAllGameHistories()).length;
//             expect(finalLength).to.equal(initialLength + 1);
//         });

//         it('last gameHistory should be the one we just added', async () => {
//             await gameHistoriesService.addGameHistory(OTHER_GAME_HISTORY);
//             const gameHistories = await gameHistoriesService.getAllGameHistories();
//             expect(gameHistories[gameHistories.length - 1]).to.deep.equal(OTHER_GAME_HISTORY);
//         });
//     });

//     describe('resetGameHistories', () => {
//         it('should delete all documents of the array', async () => {
//             await gameHistoriesService.resetGameHistories();
//             const gameHistories = await gameHistoriesService.getAllGameHistories();
//             expect(gameHistories.length).to.equal(0);
//         });
//     });

//     describe('Error handling', async () => {
//         it('should throw an error if we try to access the database on a closed connection', async () => {
//             await client.close();
//             expect(gameHistoriesService['getAllGameHistories']()).to.eventually.be.rejectedWith(Error);
//         });
//     });
// });

const DEFAULT_PLAYER_1: NoId<GameHistoryPlayer, 'playerIndex'> = {
    name: 'p1',
    score: 1,
    isVirtualPlayer: false,
    isWinner: false,
};
const DEFAULT_PLAYER_2: NoId<GameHistoryPlayer, 'playerIndex'> = {
    name: 'p2',
    score: 2,
    isVirtualPlayer: true,
    isWinner: true,
};
const DEFAULT_GAME_HISTORY: NoIdGameHistoryWithPlayers = {
    startTime: new Date(),
    endTime: new Date(),
    gameType: 'default',
    gameMode: 'solo',
    hasBeenAbandoned: false,
    playersData: [DEFAULT_PLAYER_1, DEFAULT_PLAYER_2],
};

describe('GameHistoriesService', () => {
    let testingUnit: ServicesTestingUnit;
    let gameHistoriesService: GameHistoriesService;

    beforeEach(async () => {
        testingUnit = new ServicesTestingUnit();
        await testingUnit.withMockDatabaseService();
    });

    beforeEach(() => {
        gameHistoriesService = Container.get(GameHistoriesService);
    });

    afterEach(() => {
        testingUnit.restore();
    });

    describe('getAllGameHistories', () => {
        it('should return empty array if none', async () => {
            expect((await gameHistoriesService.getAllGameHistories()).length).to.equal(0);
        });

        it('should return game histories', async () => {
            await gameHistoriesService.addGameHistory(DEFAULT_GAME_HISTORY);

            expect((await gameHistoriesService.getAllGameHistories()).length).to.equal(1);
        });
    });

    describe('addGameHistory', () => {
        it('should insert data for GameHistory table', async () => {
            await gameHistoriesService.addGameHistory(DEFAULT_GAME_HISTORY);

            expect((await gameHistoriesService['table'].select('*')).length).to.equal(1);
        });

        it('should insert data for GameHistoryPlayer table', async () => {
            await gameHistoriesService.addGameHistory(DEFAULT_GAME_HISTORY);

            expect((await gameHistoriesService['tableHistoryPlayer'].select('*')).length).to.equal(DEFAULT_GAME_HISTORY.playersData.length);
        });
    });

    describe('resetGameHistories', () => {
        it('should delete entries from GameHistory table', async () => {
            await gameHistoriesService.addGameHistory(DEFAULT_GAME_HISTORY);
            await gameHistoriesService.resetGameHistories();

            expect((await gameHistoriesService['table'].select('*')).length).to.equal(0);
        });

        it('should delete entries from GameHistoryPlayer table', async () => {
            await gameHistoriesService.addGameHistory(DEFAULT_GAME_HISTORY);
            await gameHistoriesService.resetGameHistories();

            expect((await gameHistoriesService['tableHistoryPlayer'].select('*')).length).to.equal(0);
        });
    });
});
