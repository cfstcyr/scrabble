/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import Game from '@app/classes/game/game';
import { ReadyGameConfig } from '@app/classes/game/game-config';
import { GameMode } from '@app/classes/game/game-mode';
import { GameType } from '@app/classes/game/game-type';
import Player from '@app/classes/player/player';
import { TEST_DICTIONARY } from '@app/constants/dictionary-tests-const';
import { INVALID_PLAYER_ID_FOR_GAME, NO_GAME_FOUND_WITH_ID } from '@app/constants/services-errors';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import { ActiveGameService } from './active-game.service';

const expect = chai.expect;

chai.use(spies);
chai.use(chaiAsPromised);

const DEFAULT_PLAYER_1 = new Player('id1', 'player1');
const DEFAULT_PLAYER_2 = new Player('id2', 'player2');
const DEFAULT_PLAYER_3 = new Player('id3', 'player3');
const DEFAULT_PLAYER_4 = new Player('id4', 'player4');
const DEFAULT_ID = 'gameId';
const DEFAULT_MULTIPLAYER_CONFIG: ReadyGameConfig = {
    player1: DEFAULT_PLAYER_1,
    player2: DEFAULT_PLAYER_2,
    player3: DEFAULT_PLAYER_3,
    player4: DEFAULT_PLAYER_4,
    gameType: GameType.Classic,
    gameMode: GameMode.Multiplayer,
    maxRoundTime: 1,
    dictionary: TEST_DICTIONARY,
};
const DEFAULT_GAME = {
    player1: DEFAULT_PLAYER_1,
    player2: DEFAULT_PLAYER_2,
    player3: DEFAULT_PLAYER_3,
    player4: DEFAULT_PLAYER_4,
    id: DEFAULT_ID,
    gameIsOver: false,

    getId: () => DEFAULT_ID,
    createStartGameData: () => undefined,
    areGameOverConditionsMet: () => true,
};

describe('ActiveGameService', () => {
    let activeGameService: ActiveGameService;

    beforeEach(() => {
        activeGameService = new ActiveGameService();
    });

    it('should create', () => {
        expect(activeGameService).to.exist;
    });

    it('should instantiate empty activeGame list', () => {
        expect(activeGameService['activeGames']).to.exist;
        expect(activeGameService['activeGames']).to.be.empty;
    });

    describe('beginGame', () => {
        let spy: unknown;

        beforeEach(() => {
            spy = chai.spy.on(Game, 'createGame', async () => Promise.resolve(DEFAULT_GAME));
        });

        afterEach(() => {
            chai.spy.restore(Game);
        });

        it('should add a game to activeGame list', async () => {
            expect(activeGameService['activeGames']).to.be.empty;
            await activeGameService.beginGame(DEFAULT_ID, DEFAULT_MULTIPLAYER_CONFIG);
            expect(activeGameService['activeGames']).to.have.lengthOf(1);
        });

        it('should call Game.createGame', async () => {
            await activeGameService.beginGame(DEFAULT_ID, DEFAULT_MULTIPLAYER_CONFIG);
            expect(spy).to.have.been.called();
        });
    });

    describe('getGame', () => {
        beforeEach(async () => {
            chai.spy.on(Game, 'createMultiplayerGame', async () => Promise.resolve(DEFAULT_GAME));
            await activeGameService.beginGame(DEFAULT_ID, DEFAULT_MULTIPLAYER_CONFIG);
        });

        afterEach(() => {
            chai.spy.restore(Game);
        });

        it('should return game with player1 ID', () => {
            expect(activeGameService.getGame(DEFAULT_ID, DEFAULT_PLAYER_1.id)).to.exist;
        });

        it('should return game with player2 ID', () => {
            expect(activeGameService.getGame(DEFAULT_ID, DEFAULT_PLAYER_2.id)).to.exist;
        });

        it('should throw is ID is invalid', () => {
            const invalidId = 'invalidId';
            expect(() => activeGameService.getGame(invalidId, DEFAULT_PLAYER_1.id)).to.throw(NO_GAME_FOUND_WITH_ID);
        });

        it('should throw is player ID is invalid', () => {
            const invalidId = 'invalidId';
            expect(() => activeGameService.getGame(DEFAULT_ID, invalidId)).to.throw(INVALID_PLAYER_ID_FOR_GAME);
        });
    });

    describe('removeGame', () => {
        beforeEach(async () => {
            chai.spy.on(Game, 'createMultiplayerGame', async () => Promise.resolve(DEFAULT_GAME));
            await activeGameService.beginGame(DEFAULT_ID, DEFAULT_MULTIPLAYER_CONFIG);
        });

        afterEach(() => {
            chai.spy.restore(Game);
        });

        it('should remove from list with player1 ID', () => {
            expect(activeGameService['activeGames']).to.have.lengthOf(1);
            activeGameService.removeGame(DEFAULT_ID, DEFAULT_PLAYER_1.id);
            expect(activeGameService['activeGames']).to.be.empty;
        });

        it('should remove from list with player2 ID', () => {
            expect(activeGameService['activeGames']).to.have.lengthOf(1);
            activeGameService.removeGame(DEFAULT_ID, DEFAULT_PLAYER_2.id);
            expect(activeGameService['activeGames']).to.be.empty;
        });

        it('should throw and return undefined ', () => {
            chai.spy.on(activeGameService, 'getGame', () => {
                throw new Error();
            });
            activeGameService.removeGame(DEFAULT_ID, DEFAULT_PLAYER_2.id);
            const spy = chai.spy.on(activeGameService['activeGames'], 'indexOf');
            expect(spy).not.to.have.been.called();
        });
    });

    it('isGameOver should return if the game with the game id provided is over', () => {
        chai.spy.on(activeGameService, 'getGame', () => DEFAULT_GAME);
        expect(activeGameService.isGameOver(DEFAULT_ID, DEFAULT_PLAYER_1.id)).to.be.equal(DEFAULT_GAME.gameIsOver);
    });
});
