/* eslint-disable max-lines */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import Player from '@app/classes/player/player';
import { LetterValue, Tile } from '@app/classes/tile';
import TileReserve from '@app/classes/tile/tile-reserve';
import BoardService from '@app/services/board/board.service';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import { createStubInstance, SinonStub, SinonStubbedInstance, stub } from 'sinon';
import { Container } from 'typedi';
import RoundManager from '@app/classes/round/round-manager';
import Game, { GAME_OVER_PASS_THRESHOLD } from './game';
import { MultiplayerGameConfig } from './game-config';
import { GameType } from './game.type';
import { INVALID_PLAYER_ID_FOR_GAME } from '@app/constants/services-errors';
import { assert } from 'chai';

const expect = chai.expect;

chai.use(spies);
chai.use(chaiAsPromised);

const DEFAULT_GAME_ID = 'gameId';

const DEFAULT_PLAYER_1_ID = '1';
const DEFAULT_PLAYER_2_ID = '2';
const DEFAULT_PLAYER_1 = new Player(DEFAULT_PLAYER_1_ID, 'player1');
const DEFAULT_PLAYER_2 = new Player(DEFAULT_PLAYER_2_ID, 'player2');
const DEFAULT_MULTIPLAYER_CONFIG: MultiplayerGameConfig = {
    player1: DEFAULT_PLAYER_1,
    player2: DEFAULT_PLAYER_2,
    gameType: GameType.Classic,
    maxRoundTime: 1,
    dictionary: 'francais',
};
const DEFAULT_TILE: Tile = { letter: 'A', value: 1 };
const DEFAULT_TILE_2: Tile = { letter: 'B', value: 5 };

const DEFAULT_AMOUNT_OF_TILES = 25;
const DEFAULT_MAP = new Map<LetterValue, number>([
    ['A', 0],
    ['B', 0],
]);

describe('Game', () => {
    let defaultInit: () => Promise<void>;

    beforeEach(() => {
        defaultInit = TileReserve.prototype.init;
        TileReserve.prototype.init = async function () {
            this['initialized'] = true;
            for (let i = 0; i < DEFAULT_AMOUNT_OF_TILES; ++i) {
                this['tiles'].push({ ...DEFAULT_TILE });
            }
            this['referenceTiles'] = [...this['tiles']];
            return Promise.resolve();
        };

        const boardService = Container.get(BoardService);
        Game.injectServices(boardService);
    });

    afterEach(() => {
        TileReserve.prototype.init = defaultInit;
    });

    describe('createMultiplayerGame', () => {
        let game: Game;

        beforeEach(async () => {
            game = await Game.createMultiplayerGame(DEFAULT_GAME_ID, DEFAULT_MULTIPLAYER_CONFIG);
        });

        it('should create', () => {
            expect(game).to.exist;
        });

        it('should instantiate attributes', () => {
            expect(game.player1).to.exist;
            expect(game.player2).to.exist;
            expect(game.roundManager).to.exist;
            expect(game.wordsPlayed).to.exist;
            expect(game.gameType).to.exist;
            expect(game['tileReserve']).to.exist;
            expect(game.board).to.exist;
        });

        it('should init TileReserve', () => {
            expect(game['tileReserve'].isInitialized()).to.be.true;
        });

        it('should give players their tiles', () => {
            expect(game.player1.tiles).to.not.be.empty;
            expect(game.player2.tiles).to.not.be.empty;
        });
    });

    describe('createSoloGame', () => {
        it('is not implemented', () => {
            return expect(Game.createSoloGame()).to.be.rejectedWith('Solo mode not implemented');
        });
    });

    describe('General', () => {
        let game: Game;
        let tileReserveStub: SinonStubbedInstance<TileReserve>;

        beforeEach(async () => {
            game = await Game.createMultiplayerGame(DEFAULT_GAME_ID, DEFAULT_MULTIPLAYER_CONFIG);
            tileReserveStub = createStubInstance(TileReserve);
            game['tileReserve'] = tileReserveStub as unknown as TileReserve;
        });

        it('getId should return an id', () => {
            expect(game.getId()).to.exist;
        });

        it('initTileReserve should call init ', async () => {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            const initStub = tileReserveStub.init.callsFake(async () => {});
            await game.initTileReserve();
            assert(initStub.calledOnce);
        });

        it('getTiles should call tileReserve.getTiles and return it', () => {
            const expected = [DEFAULT_TILE];
            tileReserveStub.getTiles.returns([DEFAULT_TILE]);
            expect(game.getTilesFromReserve(1)).to.deep.equal(expected);
            assert(tileReserveStub.getTiles.calledOnce);
        });

        it('swapTiles should call tileReserve.swapTiles and return it', () => {
            const expected = [DEFAULT_TILE];
            tileReserveStub.swapTiles.returns([DEFAULT_TILE]);
            expect(game.swapTilesFromReserve([DEFAULT_TILE_2])).to.deep.equal(expected);
            assert(tileReserveStub.swapTiles.calledOnce);
        });

        it('swapTiles should call tileReserve.getTilesLeftPerLetter and return it', () => {
            const expected = DEFAULT_MAP;
            tileReserveStub.getTilesLeftPerLetter.returns(DEFAULT_MAP);
            expect(game.getTilesLeftPerLetter()).to.deep.equal(expected);
            assert(tileReserveStub.getTilesLeftPerLetter.calledOnce);
        });

        describe('getActivePlayer', () => {
            it('should return player with same id (player 1)', () => {
                const player = game.getRequestingPlayer(DEFAULT_PLAYER_1.id);
                expect(player).to.equal(DEFAULT_PLAYER_1);
            });

            it('should return player with same id (player 2)', () => {
                const player = game.getRequestingPlayer(DEFAULT_PLAYER_2.id);
                expect(player).to.equal(DEFAULT_PLAYER_2);
            });

            it('should throw error if invalid id', () => {
                const invalidId = 'invalidId';
                expect(() => game.getRequestingPlayer(invalidId)).to.throw(INVALID_PLAYER_ID_FOR_GAME);
            });
        });

        describe('getOpponentPlayer', () => {
            it('should return player with other id (player 1)', () => {
                const player = game.getOpponentPlayer(DEFAULT_PLAYER_1.id);
                expect(player).to.equal(DEFAULT_PLAYER_2);
            });

            it('should return player with other id (player 2)', () => {
                const player = game.getOpponentPlayer(DEFAULT_PLAYER_2.id);
                expect(player).to.equal(DEFAULT_PLAYER_1);
            });

            it('should throw error if invalid id', () => {
                const invalidId = 'invalidId';
                expect(() => game.getOpponentPlayer(invalidId)).to.throw(INVALID_PLAYER_ID_FOR_GAME);
            });
        });
    });

    describe('isGameOver', () => {
        let game: Game;
        let roundManagerStub: SinonStubbedInstance<RoundManager>;

        beforeEach(() => {
            game = new Game();
            roundManagerStub = createStubInstance(RoundManager);
            game.roundManager = roundManagerStub as unknown as RoundManager;
            game.player1 = DEFAULT_PLAYER_1;
            game.player2 = DEFAULT_PLAYER_2;

            game.player1.tiles = [
                { letter: 'A', value: 0 },
                { letter: 'B', value: 0 },
            ];
            game.player2.tiles = [
                { letter: 'A', value: 0 },
                { letter: 'B', value: 0 },
            ];
            // game.player1 = player1Stub as unknown as Player;
            // game.player2 = player2Stub as unknown as Player;
            // player1Stub.hasTilesLeft.returns(true);
            // player2Stub.hasTilesLeft.returns(true);

            roundManagerStub.getPassCounter.returns(0);
        });

        it('should not be gameOver passCount lower than threshold and both players have tiles', () => {
            roundManagerStub.getPassCounter.returns(GAME_OVER_PASS_THRESHOLD - 1);
            expect(game.isGameOver()).to.be.false;
        });

        it('should be gameOver passCount is equal to threshold', () => {
            roundManagerStub.getPassCounter.returns(GAME_OVER_PASS_THRESHOLD);

            expect(game.isGameOver()).to.be.true;
        });

        it('should be gameOver when player 1 has no tiles', () => {
            // player1Stub.hasTilesLeft.returns(false);
            expect(game.isGameOver()).to.be.true;
            expect(game.roundManager.getPassCounter()).to.equal(0);
        });

        it('should gameOver when player 2 has no tiles', () => {
            // player2Stub.hasTilesLeft.returns(false);
            expect(game.isGameOver()).to.be.true;
            expect(game.roundManager.getPassCounter()).to.equal(0);
        });
    });

    describe('endOfGame', () => {
        let game: Game;
        let roundManagerStub: SinonStubbedInstance<RoundManager>;
        let player1Stub: SinonStubbedInstance<Player>;
        let player2Stub: SinonStubbedInstance<Player>;
        const PLAYER_1_SCORE = 20;
        const PLAYER_2_SCORE = 40;
        const PLAYER_1_TILE_SCORE = 6;
        const PLAYER_2_TILE_SCORE = 14;
        beforeEach(() => {
            game = new Game();
            roundManagerStub = createStubInstance(RoundManager);
            player1Stub = createStubInstance(Player);
            player2Stub = createStubInstance(Player);
            game.roundManager = roundManagerStub as unknown as RoundManager;
            game.player1 = player1Stub as unknown as Player;
            game.player2 = player2Stub as unknown as Player;

            game.player1.tiles = [
                { letter: 'A', value: 2 },
                { letter: 'B', value: 4 },
            ];
            game.player2.tiles = [
                { letter: 'A', value: 6 },
                { letter: 'B', value: 8 },
            ];

            game.player1.score = PLAYER_1_SCORE;
            game.player2.score = PLAYER_2_SCORE;
            player1Stub.getTileRackPoints.returns(PLAYER_1_TILE_SCORE);
            player2Stub.getTileRackPoints.returns(PLAYER_2_TILE_SCORE);
        });

        it('should deduct points from both player if the getPassCounter is exceeded', () => {
            roundManagerStub.getPassCounter.returns(GAME_OVER_PASS_THRESHOLD);
            game.endOfGame();
            expect(game.player1.score).to.equal(PLAYER_1_SCORE - PLAYER_1_TILE_SCORE);
            expect(game.player2.score).to.equal(PLAYER_2_SCORE - PLAYER_2_TILE_SCORE);
        });

        it('should deduct points from player2 and add them to player1 if player 1 has no tiles', () => {
            roundManagerStub.getPassCounter.returns(0);
            player1Stub.hasTilesLeft.returns(false);
            player2Stub.hasTilesLeft.returns(true);

            game.endOfGame();

            expect(game.player1.score).to.equal(PLAYER_1_SCORE + PLAYER_2_TILE_SCORE);
            expect(game.player2.score).to.equal(PLAYER_2_SCORE - PLAYER_2_TILE_SCORE);
        });

        it('should deduct points from player1 and add them to player2 if player 2 has no tiles', () => {
            roundManagerStub.getPassCounter.returns(0);
            player1Stub.hasTilesLeft.returns(true);
            player2Stub.hasTilesLeft.returns(false);

            game.endOfGame();

            expect(game.player1.score).to.equal(PLAYER_1_SCORE - PLAYER_1_TILE_SCORE);
            expect(game.player2.score).to.equal(PLAYER_2_SCORE + PLAYER_1_TILE_SCORE);
        });
    });

    describe('endGameMessage', () => {
        let game: Game;
        let player1Stub: SinonStubbedInstance<Player>;
        let player2Stub: SinonStubbedInstance<Player>;

        let congratulateStub: SinonStub<[], string>;

        const PLAYER_1_END_GAME_MESSAGE = 'player1 : ABC';
        const PLAYER_2_END_GAME_MESSAGE = 'player2 : SOS';

        beforeEach(() => {
            game = new Game();
            player1Stub = createStubInstance(Player);
            player2Stub = createStubInstance(Player);
            game.player1 = player1Stub as unknown as Player;
            game.player2 = player2Stub as unknown as Player;
            player1Stub.endGameMessage.returns(PLAYER_1_END_GAME_MESSAGE);
            player2Stub.endGameMessage.returns(PLAYER_2_END_GAME_MESSAGE);
            congratulateStub = stub(game, 'congratulateWinner').returns('congratulate winner');
        });

        it('should call the messages ', () => {
            game.endGameMessage();
            assert(player1Stub.endGameMessage.calledOnce);
            assert(player2Stub.endGameMessage.calledOnce);
            assert(congratulateStub.calledOnce);
        });
    });

    describe('congratulateWinner', () => {
        let game: Game;
        let player1Stub: SinonStubbedInstance<Player>;
        let player2Stub: SinonStubbedInstance<Player>;
        const PLAYER_1_NAME = 'VINCENT';
        const PLAYER_2_NAME = 'MATHILDE';
        const HIGHER_SCORE = 100;
        const LOWER_SCORE = 1;

        beforeEach(() => {
            game = new Game();
            player1Stub = createStubInstance(Player);
            player2Stub = createStubInstance(Player);
            game.player1 = player1Stub as unknown as Player;
            game.player2 = player2Stub as unknown as Player;
            player1Stub.name = PLAYER_1_NAME;
            player2Stub.name = PLAYER_2_NAME;
        });

        it('should congratulate player 1 if he has a higher score ', () => {
            player1Stub.score = HIGHER_SCORE;
            player2Stub.score = LOWER_SCORE;
            const expectedMessage = Game.winnerMessage(PLAYER_1_NAME);
            expect(game.congratulateWinner()).to.deep.equal(expectedMessage);
        });
        it('should congratulate player 2 if he has a higher score ', () => {
            player1Stub.score = LOWER_SCORE;
            player2Stub.score = HIGHER_SCORE;
            const expectedMessage = Game.winnerMessage(PLAYER_2_NAME);
            expect(game.congratulateWinner()).to.deep.equal(expectedMessage);
        });
        it('should congratulate player 1 and player 2 if they are tied ', () => {
            player1Stub.score = HIGHER_SCORE;
            player2Stub.score = HIGHER_SCORE;
            const expectedMessage = Game.winnerMessage(`${PLAYER_1_NAME} et ${PLAYER_2_NAME}`);
            expect(game.congratulateWinner()).to.deep.equal(expectedMessage);
        });
    });

    describe('isPlayer1', () => {
        let game: Game;

        beforeEach(() => {
            game = new Game();
            game.player1 = DEFAULT_PLAYER_1;
            game.player2 = DEFAULT_PLAYER_2;

            game.player1.tiles = [
                { letter: 'A', value: 0 },
                { letter: 'B', value: 0 },
            ];
            game.player2.tiles = [
                { letter: 'A', value: 0 },
                { letter: 'B', value: 0 },
            ];
        });

        it('should be true if player is player 1', () => {
            expect(game.isPlayer1(DEFAULT_PLAYER_1)).to.be.true;
        });

        it('should be false if player is player 2', () => {
            expect(game.isPlayer1(DEFAULT_PLAYER_2)).to.be.false;
        });

        it('should be true if player id is player 1 id', () => {
            expect(game.isPlayer1(DEFAULT_PLAYER_1_ID)).to.be.true;
        });

        it('should be false if player id is player 2 id', () => {
            expect(game.isPlayer1(DEFAULT_PLAYER_2_ID)).to.be.false;
        });
    });
});

describe('Game Type', () => {
    it('should contain Classic', () => {
        expect(GameType.Classic).to.equal('Classique');
    });

    it('should contain LOG2990', () => {
        expect(GameType.LOG2990).to.equal('LOG2990');
    });
});

describe('Game Service Injection', () => {
    it('injectServices should set static Game BoardService', () => {
        chai.spy.on(Game, 'getBoardService', () => null);
        const boardService = Container.get(BoardService);

        expect(Game['getBoardService']()).to.not.exist;
        Game.injectServices(boardService);
        chai.spy.restore();
        expect(Game['getBoardService']()).to.equal(boardService);
    });

    it('injectServices should call getBoardService()', () => {
        const boardService = Container.get(BoardService);
        chai.spy.on(Game, 'getBoardService', () => boardService);
        Game.injectServices(boardService);
        expect(Game['getBoardService']).to.have.been.called;
    });
});
