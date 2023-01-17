/* eslint-disable dot-notation */
import { expect } from 'chai';
import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
import GameHistoriesService from './game-history.service';
import { GameHistoryPlayer, NoIdGameHistoryWithPlayers } from '@app/schemas/game-history';
import { NoId } from '@app/schemas/schema';
import { Container } from 'typedi';

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
