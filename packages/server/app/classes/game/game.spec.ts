/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Board } from '@app/classes/board';
import { GameObjectivesData } from '@app/classes/communication/objective-data';
import { GameObjectives } from '@app/classes/objectives/objective-utils';
import Player from '@app/classes/player/player';
import { Round } from '@app/classes/round/round';
import RoundManager from '@app/classes/round/round-manager';
import { LetterValue, Tile } from '@app/classes/tile';
import TileReserve from '@app/classes/tile/tile-reserve';
import { TileReserveData } from '@app/classes/tile/tile.types';
import { BeginnerVirtualPlayer } from '@app/classes/virtual-player/beginner-virtual-player/beginner-virtual-player';
import { TEST_DICTIONARY } from '@app/constants/dictionary-tests-const';
import { IS_OPPONENT, IS_REQUESTING } from '@app/constants/game-constants';
import { generateGameObjectives } from '@app/classes/objectives/objectives-test-helper.spec';
import { INVALID_PLAYER_ID_FOR_GAME } from '@app/constants/services-errors';
import BoardService from '@app/services/board-service/board.service';
import ObjectivesService from '@app/services/objective-service/objective.service';
import * as copy from '@app/utils/deep-copy/deep-copy';
import * as chai from 'chai';
import { assert } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import * as sinon from 'sinon';
import { createStubInstance, SinonStub, SinonStubbedInstance, stub } from 'sinon';
import { Container } from 'typedi';
import Game, { GAME_OVER_PASS_THRESHOLD, LOSE, WIN } from './game';
import { ReadyGameConfig, StartGameData } from './game-config';
import { GameMode } from './game-mode';
import { GameType } from './game-type';
const expect = chai.expect;

chai.use(spies);
chai.use(chaiAsPromised);

const DEFAULT_GAME_ID = 'gameId';

const DEFAULT_PLAYER_1_ID = '1';
const DEFAULT_PLAYER_2_ID = '2';
const NEW_PLAYER_ID = 'newid';
const DEFAULT_PLAYER_1 = new Player(DEFAULT_PLAYER_1_ID, 'player1');
const DEFAULT_PLAYER_2 = new Player(DEFAULT_PLAYER_2_ID, 'player2');
const DEFAULT_VIRTUAL_PLAYER_ID = 'virtualplayerid';
const DEFAULT_VIRTUAL_PLAYER = new BeginnerVirtualPlayer(DEFAULT_VIRTUAL_PLAYER_ID, 'virtualplayername');

const DEFAULT_MULTIPLAYER_CONFIG: ReadyGameConfig = {
    player1: DEFAULT_PLAYER_1,
    player2: DEFAULT_PLAYER_2,
    gameType: GameType.Classic,
    gameMode: GameMode.Multiplayer,
    maxRoundTime: 1,
    dictionary: TEST_DICTIONARY,
};
const DEFAULT_TILE: Tile = { letter: 'A', value: 1 };
const DEFAULT_TILE_2: Tile = { letter: 'B', value: 5 };

const DEFAULT_AMOUNT_OF_TILES = 25;

let DEFAULT_MAP = new Map<LetterValue, number>([
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

        Game.injectServices();
    });

    afterEach(() => {
        TileReserve.prototype.init = defaultInit;
        sinon.restore();
    });

    describe('createGame', () => {
        let game: Game;
        let objectiveInitspy: sinon.SinonSpy;

        beforeEach(async () => {
            objectiveInitspy = sinon.stub(Game.prototype, <any>'initializeObjectives').callsFake(() => {
                return;
            });
            game = await Game.createGame(DEFAULT_GAME_ID, DEFAULT_MULTIPLAYER_CONFIG);
        });

        afterEach(() => {
            sinon.restore();
        });

        it('should create', () => {
            expect(game).to.exist;
        });

        it('should instantiate attributes', () => {
            expect(game.player1).to.exist;
            expect(game.player2).to.exist;
            expect(game.roundManager).to.exist;
            expect(game.gameType).to.exist;
            expect(game['tileReserve']).to.exist;
            expect(game.board).to.exist;
        });

        it('should init TileReserve', () => {
            expect(game['tileReserve'].isInitialized()).to.be.true;
        });

        it('should call initializeObjectives', () => {
            sinon.assert.called(objectiveInitspy);
        });

        it('should give players their tiles', () => {
            expect(game.player1.tiles).to.not.be.empty;
            expect(game.player2.tiles).to.not.be.empty;
        });
    });

    describe('General', () => {
        let game: Game;
        let tileReserveStub: SinonStubbedInstance<TileReserve>;

        beforeEach(async () => {
            game = await Game.createGame(DEFAULT_GAME_ID, DEFAULT_MULTIPLAYER_CONFIG);
            tileReserveStub = createStubInstance(TileReserve);
            game['tileReserve'] = tileReserveStub as unknown as TileReserve;
        });

        it('getId should return an id', () => {
            expect(game.getId()).to.exist;
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

        it('getTotalTilesLeft should call same function from tileReserve', () => {
            tileReserveStub.getTotalTilesLeft.returns(1);
            game.getTotalTilesLeft();
            assert(tileReserveStub.getTotalTilesLeft.calledOnce);
        });

        describe('getPlayer', () => {
            beforeEach(() => {
                game.player1 = DEFAULT_PLAYER_1;
                game.player2 = DEFAULT_PLAYER_2;
            });

            it('should throw INVALID_PLAYER_ID_FOR_GAME if player not from game', () => {
                chai.spy.on(game, 'isPlayerFromGame', () => false);
                expect(() => game.getPlayer(DEFAULT_PLAYER_1_ID, false)).to.throw(INVALID_PLAYER_ID_FOR_GAME);
            });

            it('should throw INVALID_PLAYER_ID_FOR_GAME if player is not from ', () => {
                chai.spy.on(game, 'isPlayerFromGame', () => false);
                expect(() => game.getPlayer('random id', false)).to.throw(INVALID_PLAYER_ID_FOR_GAME);
            });

            it('should return player 1 if id is player1 and is requesting player', () => {
                expect(game.getPlayer(DEFAULT_PLAYER_1_ID, true)).to.equal(game.player1);
            });

            it('should return player 1 if id is player1 and is NOT requesting player', () => {
                expect(game.getPlayer(DEFAULT_PLAYER_1_ID, false)).to.equal(game.player2);
            });

            it('should return player 2 if id is player2 and is requesting player', () => {
                expect(game.getPlayer(DEFAULT_PLAYER_2_ID, true)).to.equal(game.player2);
            });

            it('should return player 1 if id is player2 and is NOT requesting player', () => {
                expect(game.getPlayer(DEFAULT_PLAYER_2_ID, false)).to.equal(game.player1);
            });

            it('should throw INVALID_PLAYER_ID_FOR_GAME if player is from game but id is not player1 or player2', () => {
                chai.spy.on(game, 'isPlayerFromGame', () => true);
                expect(() => game.getPlayer('random id', false)).to.throw(INVALID_PLAYER_ID_FOR_GAME);
            });
        });

        describe('getActivePlayer', () => {
            it('should return player with same id (player 1)', () => {
                const player = game.getPlayer(DEFAULT_PLAYER_1.id, IS_REQUESTING);
                expect(player).to.equal(DEFAULT_PLAYER_1);
            });

            it('should return player with same id (player 2)', () => {
                const player = game.getPlayer(DEFAULT_PLAYER_2.id, IS_REQUESTING);
                expect(player).to.equal(DEFAULT_PLAYER_2);
            });

            it('should throw error if invalid id', () => {
                const invalidId = 'invalidId';
                expect(() => game.getPlayer(invalidId, IS_REQUESTING)).to.throw(INVALID_PLAYER_ID_FOR_GAME);
            });
        });

        describe('getOpponentPlayer', () => {
            it('should return player with other id (player 1)', () => {
                const player = game.getPlayer(DEFAULT_PLAYER_1.id, IS_OPPONENT);
                expect(player).to.equal(DEFAULT_PLAYER_2);
            });

            it('should return player with other id (player 2)', () => {
                const player = game.getPlayer(DEFAULT_PLAYER_2.id, IS_OPPONENT);
                expect(player).to.equal(DEFAULT_PLAYER_1);
            });

            it('should throw error if invalid id', () => {
                const invalidId = 'invalidId';
                expect(() => game.getPlayer(invalidId, IS_OPPONENT)).to.throw(INVALID_PLAYER_ID_FOR_GAME);
            });
        });

        describe('getConnectedRealPlayers', () => {
            it('should return both players if they are both real and connected', () => {
                game.player1.isConnected = true;
                game.player2.isConnected = true;
                expect(game.getConnectedRealPlayers()).to.deep.equal([DEFAULT_PLAYER_1, DEFAULT_PLAYER_2]);
            });

            it('should return the player that is still connected (Player 1)', () => {
                game.player1.isConnected = true;
                game.player2.isConnected = false;
                expect(game.getConnectedRealPlayers()).to.deep.equal([DEFAULT_PLAYER_1]);
            });

            it('should return the player that a real player ', () => {
                game.player1 = DEFAULT_VIRTUAL_PLAYER;
                game.player1.isConnected = true;
                game.player2.isConnected = true;
                expect(game.getConnectedRealPlayers()).to.deep.equal([DEFAULT_PLAYER_2]);
            });
        });
    });

    describe('isGameOver', () => {
        let game: Game;
        let roundManagerStub: SinonStubbedInstance<RoundManager>;
        let player1Stub: SinonStubbedInstance<Player>;
        let player2Stub: SinonStubbedInstance<Player>;

        beforeEach(() => {
            game = new Game();
            roundManagerStub = createStubInstance(RoundManager);
            player1Stub = createStubInstance(Player);
            player2Stub = createStubInstance(Player);
            game.roundManager = roundManagerStub as unknown as RoundManager;
            game.player1 = player1Stub as unknown as Player;
            game.player2 = player2Stub as unknown as Player;
            game.player1.tiles = [
                { letter: 'A', value: 0 },
                { letter: 'B', value: 0 },
            ];
            game.player2.tiles = [
                { letter: 'A', value: 0 },
                { letter: 'B', value: 0 },
            ];
            player1Stub.hasTilesLeft.returns(true);
            player2Stub.hasTilesLeft.returns(true);

            roundManagerStub.getPassCounter.returns(0);
        });

        it('should not be gameOver passCount lower than threshold and both players have tiles', () => {
            roundManagerStub.getPassCounter.returns(GAME_OVER_PASS_THRESHOLD - 1);
            expect(game.areGameOverConditionsMet()).to.be.false;
        });

        it('should be gameOver passCount is equal to threshold', () => {
            roundManagerStub.getPassCounter.returns(GAME_OVER_PASS_THRESHOLD);

            expect(game.areGameOverConditionsMet()).to.be.true;
        });

        it('should be gameOver when player 1 has no tiles', () => {
            player1Stub.hasTilesLeft.returns(false);
            expect(game.areGameOverConditionsMet()).to.be.true;
            expect(game.roundManager.getPassCounter()).to.equal(0);
        });

        it('should gameOver when player 2 has no tiles', () => {
            player2Stub.hasTilesLeft.returns(false);
            expect(game.areGameOverConditionsMet()).to.be.true;
            expect(game.roundManager.getPassCounter()).to.equal(0);
        });
    });

    describe('replacePlayer', () => {
        let game: Game;
        let roundManagerStub: SinonStubbedInstance<RoundManager>;
        let player1Stub: SinonStubbedInstance<Player>;
        let player2Stub: SinonStubbedInstance<Player>;
        let newPlayerStub: SinonStubbedInstance<Player>;

        beforeEach(() => {
            game = new Game();
            roundManagerStub = createStubInstance(RoundManager);
            player1Stub = createStubInstance(Player);
            player2Stub = createStubInstance(Player);
            newPlayerStub = createStubInstance(Player);
            player1Stub.id = DEFAULT_PLAYER_1_ID;
            player2Stub.id = DEFAULT_PLAYER_2_ID;
            newPlayerStub.id = DEFAULT_PLAYER_2_ID;
            game.roundManager = roundManagerStub as unknown as RoundManager;
            game.player1 = player1Stub as unknown as Player;
            game.player2 = player2Stub as unknown as Player;
        });

        it('should throw if the player is not from the game', () => {
            const result = () => {
                game.replacePlayer('badid', newPlayerStub as unknown as Player);
            };
            expect(result).to.throw(INVALID_PLAYER_ID_FOR_GAME);
        });

        it('should update the player1 if called with its id', () => {
            player1Stub.copyPlayerInfo.returns({ id: NEW_PLAYER_ID });
            chai.spy.on(game.roundManager, 'replacePlayer', () => {});
            game.replacePlayer(DEFAULT_PLAYER_1_ID, newPlayerStub as unknown as Player);

            expect(newPlayerStub.copyPlayerInfo.calledOnceWith(player1Stub)).to.be.true;
            expect(game.player1).to.equal(newPlayerStub);
            expect(game.player2).to.equal(player2Stub);
        });

        it('should update the player2 if called with its id', () => {
            player2Stub.copyPlayerInfo.returns({ id: NEW_PLAYER_ID });
            chai.spy.on(game.roundManager, 'replacePlayer', () => {});
            game.replacePlayer(DEFAULT_PLAYER_2_ID, newPlayerStub as unknown as Player);

            expect(newPlayerStub.copyPlayerInfo.calledOnceWith(player2Stub)).to.be.true;
            expect(game.player1).to.equal(player1Stub);
            expect(game.player2).to.equal(newPlayerStub);
        });

        it('should call roundManager.replacePlayer', () => {
            player2Stub.copyPlayerInfo.returns({ id: NEW_PLAYER_ID });
            const spy = chai.spy.on(game.roundManager, 'replacePlayer', () => {});

            game.replacePlayer(DEFAULT_PLAYER_2_ID, newPlayerStub as unknown as Player);
            expect(spy).to.have.been.called();
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
            player1Stub.name = 'Lucky Luke';
            player2Stub.name = 'Dalton';
            player1Stub.id = DEFAULT_PLAYER_1_ID;
            player2Stub.id = DEFAULT_PLAYER_2_ID;
            player1Stub.tiles = [{ letter: 'A', value: 2 } as Tile, { letter: 'B', value: 4 } as Tile];
            player2Stub.tiles = [{ letter: 'A', value: 6 } as Tile, { letter: 'B', value: 8 } as Tile];
            player1Stub.score = PLAYER_1_SCORE;
            player2Stub.score = PLAYER_2_SCORE;
            player1Stub.getTileRackPoints.returns(PLAYER_1_TILE_SCORE);
            player2Stub.getTileRackPoints.returns(PLAYER_2_TILE_SCORE);

            game.player1 = player1Stub as unknown as Player;
            game.player2 = player2Stub as unknown as Player;

            chai.spy.on(game, 'completeGameHistory', () => {
                return;
            });
        });

        it('should deduct points from both player if the getPassCounter is exceeded', () => {
            roundManagerStub.getPassCounter.returns(GAME_OVER_PASS_THRESHOLD);
            game.endOfGame(undefined);
            expect(game.player1.score).to.equal(PLAYER_1_SCORE - PLAYER_1_TILE_SCORE);
            expect(game.player2.score).to.equal(PLAYER_2_SCORE - PLAYER_2_TILE_SCORE);
        });

        it('should deduct points from player2 and add them to player1 if player 1 has no tiles', () => {
            roundManagerStub.getPassCounter.returns(0);
            player1Stub.hasTilesLeft.returns(false);
            player2Stub.hasTilesLeft.returns(true);

            game.endOfGame(undefined);

            expect(game.player1.score).to.equal(PLAYER_1_SCORE + PLAYER_2_TILE_SCORE);
            expect(game.player2.score).to.equal(PLAYER_2_SCORE - PLAYER_2_TILE_SCORE);
        });

        it('should deduct points from player1 and add them to player2 if player 2 has no tiles', () => {
            roundManagerStub.getPassCounter.returns(0);
            player1Stub.hasTilesLeft.returns(true);
            player2Stub.hasTilesLeft.returns(false);

            game.endOfGame(undefined);

            expect(game.player1.score).to.equal(PLAYER_1_SCORE - PLAYER_1_TILE_SCORE);
            expect(game.player2.score).to.equal(PLAYER_2_SCORE + PLAYER_1_TILE_SCORE);
        });

        it('should call computeEndOfGameScore with player1Win if winnerName is player1.name', () => {
            roundManagerStub.getPassCounter.returns(0);
            const player1WinSpy = chai.spy.on(game, 'computeEndOfGameScore');
            game.endOfGame(game.player1.name);

            expect(player1WinSpy).to.have.been.called.with(WIN, LOSE);
        });

        it('should call computeEndOfGameScore with player2Win if winnerName is player2.name', () => {
            roundManagerStub.getPassCounter.returns(0);
            const player2WinSpy = chai.spy.on(game, 'computeEndOfGameScore');
            game.endOfGame(game.player2.name);

            expect(player2WinSpy).to.have.been.called.with(LOSE, WIN);
        });
    });

    describe('completeGameHistory', () => {
        let game: Game;
        let roundManagerStub: SinonStubbedInstance<RoundManager>;
        let player1Stub: SinonStubbedInstance<Player>;
        let player2Stub: SinonStubbedInstance<Player>;
        const PLAYER_1_SCORE = 20;
        const PLAYER_2_SCORE = 40;
        const PLAYER_1_NAME = 'Lucky Luke';
        const PLAYER_2_NAME = 'Joe Dalton';
        const PLAYER_1_TILE_SCORE = 6;
        const PLAYER_2_TILE_SCORE = 14;

        beforeEach(() => {
            game = new Game();
            roundManagerStub = createStubInstance(RoundManager);
            player1Stub = createStubInstance(Player);
            player2Stub = createStubInstance(Player);
            game.roundManager = roundManagerStub as unknown as RoundManager;
            player1Stub.name = PLAYER_1_NAME;
            player2Stub.name = PLAYER_2_NAME;
            player1Stub.id = DEFAULT_PLAYER_1_ID;
            player2Stub.id = DEFAULT_PLAYER_2_ID;
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
            game.player1.isConnected = true;
            game.player2.isConnected = true;
            player1Stub.getTileRackPoints.returns(PLAYER_1_TILE_SCORE);
            player2Stub.getTileRackPoints.returns(PLAYER_2_TILE_SCORE);
        });

        it('should set hasBeenAbandonned to false if no player is disconnected', () => {
            game.completeGameHistory(undefined);
            expect(game.gameHistory.hasBeenAbandoned).to.be.false;
        });

        it('should set hasBeenAbandonned to true if player1 is disconnected', () => {
            game.player1.isConnected = false;
            game.completeGameHistory(undefined);
            expect(game.gameHistory.hasBeenAbandoned).to.be.true;
        });

        it('should set hasBeenAbandonned to true if player2 is disconnected', () => {
            game.player2.isConnected = false;
            game.completeGameHistory(undefined);
            expect(game.gameHistory.hasBeenAbandoned).to.be.true;
        });

        describe('isPlayerWinner', () => {
            it('should set player1Data.isWinner to true if player1 is winner', () => {
                expect(game.isPlayerWinner(PLAYER_1_NAME, game.player1, game.player2)).to.be.true;
            });

            it('should set player1Data.isWinner to true if winnerName is not player 1 but player1 has highest score', () => {
                game.player1.score = 100;
                game.player2.score = 90;
                expect(game.isPlayerWinner(undefined, game.player1, game.player2)).to.be.true;
            });

            it('should set player1Data.isWinner to false if winnerName is not player 1 and player1 does not have highest score', () => {
                game.player1.score = 90;
                game.player2.score = 100;
                expect(game.isPlayerWinner(undefined, game.player1, game.player2)).to.be.false;
            });

            it('should set player2Data.isWinner to true if player1 is winner', () => {
                expect(game.isPlayerWinner(PLAYER_2_NAME, game.player2, game.player1)).to.be.true;
            });

            it('should set player2Data.isWinner to true if winnerName is not player 1 but player1 has highest score', () => {
                game.player2.score = 100;
                game.player1.score = 90;
                expect(game.isPlayerWinner(undefined, game.player2, game.player1)).to.be.true;
            });

            it('should set player1Data.isWinner to false if winnerName is not player 1 and player1 does not have highest score', () => {
                game.player2.score = 90;
                game.player1.score = 100;
                expect(game.isPlayerWinner(undefined, game.player2, game.player1)).to.be.false;
            });

            it('should set both playerData.isWinner to true if winnerName is undefined and players have equal scores', () => {
                game.player1.score = 100;
                game.player2.score = 100;
                game.completeGameHistory(undefined);
                expect(game.gameHistory.player1Data.isWinner).to.be.true;
                expect(game.gameHistory.player2Data.isWinner).to.be.true;
            });
        });
    });

    describe('endGameMessage', () => {
        let game: Game;
        let player1Stub: SinonStubbedInstance<Player>;
        let player2Stub: SinonStubbedInstance<Player>;

        let computeWinnersSpy: SinonStub<any[], any>;

        const PLAYER_1_END_GAME_MESSAGE = 'player1 : ABC';
        const PLAYER_2_END_GAME_MESSAGE = 'player2 : SOS';

        beforeEach(() => {
            game = new Game();
            player1Stub = createStubInstance(Player);
            player2Stub = createStubInstance(Player);
            player1Stub.name = 'Darth Vader';
            player2Stub.name = 'Obi Wan Kenobi';
            game.player1 = player1Stub as unknown as Player;
            game.player2 = player2Stub as unknown as Player;
            player1Stub.endGameMessage.returns(PLAYER_1_END_GAME_MESSAGE);
            player2Stub.endGameMessage.returns(PLAYER_2_END_GAME_MESSAGE);
            computeWinnersSpy = stub(game, <any>'computeWinners').returns([player1Stub.name]);
        });

        it('should call the messages', () => {
            game.endGameMessage(undefined);
            assert(player1Stub.endGameMessage.calledOnce);
            assert(player2Stub.endGameMessage.calledOnce);
        });

        it('should call computeWinners if winnerName is undefined', () => {
            game.endGameMessage(undefined);
            assert(computeWinnersSpy.calledOnce);
        });

        it('should call winnerMessage with winner directly if winner name is provided ', () => {
            game.endGameMessage(game.player1.name);
            expect(computeWinnersSpy.calledOnce).to.be.false;
        });
    });

    describe('computeWinners', () => {
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
            player1Stub.name = PLAYER_1_NAME;
            player2Stub.name = PLAYER_2_NAME;
            game.player1 = player1Stub as unknown as Player;
            game.player2 = player2Stub as unknown as Player;
        });

        it('should return player 1 name if he has a higher score ', () => {
            player1Stub.score = HIGHER_SCORE;
            player2Stub.score = LOWER_SCORE;
            const expected = [PLAYER_1_NAME];
            expect(game['computeWinners']()).to.deep.equal(expected);
        });
        it('should congratulate player 2 if he has a higher score ', () => {
            player1Stub.score = LOWER_SCORE;
            player2Stub.score = HIGHER_SCORE;
            const expected = [PLAYER_2_NAME];
            expect(game['computeWinners']()).to.deep.equal(expected);
        });
        it('should congratulate player 1 and player 2 if they are tied ', () => {
            player1Stub.score = HIGHER_SCORE;
            player2Stub.score = HIGHER_SCORE;
            const expected = [PLAYER_1_NAME, PLAYER_2_NAME];
            expect(game['computeWinners']()).to.deep.equal(expected);
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
    describe('Game Type', () => {
        it('should contain Classic', () => {
            expect(GameType.Classic).to.equal('Classique');
        });

        it('should contain LOG2990', () => {
            expect(GameType.LOG2990).to.equal('LOG2990');
        });
    });

    describe('Game Service Injection', () => {
        afterEach(() => {
            chai.spy.restore();
        });

        it('injectServices should set static Game BoardService if it does not exist', () => {
            Game['boardService'] = undefined as unknown as BoardService;

            Game.injectServices();
            expect(Game['boardService']).to.equal(Container.get(BoardService));
        });

        it('injectServices should set static Game ObjectivesService if it does not exist', () => {
            Game['objectivesService'] = undefined as unknown as ObjectivesService;

            Game.injectServices();
            expect(Game['objectivesService']).to.equal(Container.get(ObjectivesService));
        });

        it('injectServices should NOT set BoardService and ObjectivesService if they exist', () => {
            Game['boardService'] = Container.get(BoardService);
            Game['objectivesService'] = Container.get(ObjectivesService);
            const getSpy = chai.spy.on(Container, 'get');

            Game.injectServices();
            expect(getSpy).not.to.have.been.called();
        });
    });

    describe('createStartGameData', () => {
        const PLAYER_1_ID = 'player1Id';
        const PLAYER_2_ID = 'player2Id';
        const PLAYER_1_NAME = 'player1Name';
        const PLAYER_2_NAME = 'player2Name';
        const PLAYER_2 = new Player(PLAYER_2_ID, PLAYER_2_NAME);
        const PLAYER_1 = new Player(PLAYER_1_ID, PLAYER_1_NAME);
        const DEFAULT_TIME = 60;
        DEFAULT_MAP = new Map<LetterValue, number>([
            ['A', 1],
            ['B', 2],
            ['C', 2],
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            ['F', 8],
        ]);
        const TILE_RESERVE_DATA: TileReserveData[] = [
            { letter: 'A', amount: 1 },
            { letter: 'B', amount: 2 },
            { letter: 'C', amount: 2 },
            { letter: 'F', amount: 8 },
        ];
        let roundManagerStub: SinonStubbedInstance<RoundManager>;
        let board: Board;
        let round: Round;
        let game: Game;

        beforeEach(() => {
            game = new Game();
            board = new Board([[]]);
            roundManagerStub = createStubInstance(RoundManager);
            roundManagerStub.getMaxRoundTime.returns(DEFAULT_TIME);
            game.player1 = PLAYER_1;
            game.player2 = PLAYER_2;
            chai.spy.on(game, 'getTilesLeftPerLetter', () => DEFAULT_MAP);
            game.gameType = GameType.Classic;
            game.dictionarySummary = TEST_DICTIONARY;
            chai.spy.on(game, 'getId', () => DEFAULT_GAME_ID);
            game.board = board;
            chai.spy.on(game.board, ['isWithinBounds'], () => true);
            game.roundManager = roundManagerStub as unknown as RoundManager;

            round = { player: game.player1, startTime: new Date(), limitTime: new Date() };
            roundManagerStub.getCurrentRound.returns(round);
        });

        it('should return the expected StartMultiplayerGameData', () => {
            const result = game['createStartGameData']();
            const expectedMultiplayerGameData: StartGameData = {
                player1: game.player1.convertToPlayerData(),
                player2: game.player2.convertToPlayerData(),
                gameType: game.gameType,
                gameMode: game.gameMode,
                maxRoundTime: DEFAULT_TIME,
                dictionary: TEST_DICTIONARY,
                gameId: DEFAULT_GAME_ID,
                board: game.board.grid,
                tileReserve: TILE_RESERVE_DATA,
                round: roundManagerStub.convertRoundToRoundData(round),
            };
            expect(result).to.deep.equal(expectedMultiplayerGameData);
        });
    });

    describe('initializeObjectives', () => {
        let game: Game;
        let objectives: GameObjectives;
        let initSpy: unknown;

        beforeEach(() => {
            game = new Game();
            objectives = generateGameObjectives();
            initSpy = chai.spy.on(Game['objectivesService'], 'createObjectivesForGame', () => objectives);
            chai.spy.on(copy, 'setDeepCopy', () => new Set());
        });

        afterEach(() => {
            chai.spy.restore();
        });

        it('should initialize objectives if gameType is LOG2990', async () => {
            game.gameType = GameType.LOG2990;
            game.player1 = DEFAULT_PLAYER_1;
            game.player2 = DEFAULT_PLAYER_2;
            const player1Spy = chai.spy.on(game.player1, 'initializeObjectives', () => {});
            const player2Spy = chai.spy.on(game.player2, 'initializeObjectives', () => {});
            game['initializeObjectives']();
            expect(initSpy).to.have.been.called();
            expect(player1Spy).to.have.been.called();
            expect(player2Spy).to.have.been.called();
        });

        it('should NOT initialize objectives if gameType is CLASSIC', async () => {
            game.gameType = GameType.Classic;
            game['initializeObjectives']();
            expect(initSpy).not.to.have.been.called();
        });
    });

    it('resetPlayerObjectiveProgression should call reset on ObjectiveService', () => {
        const updateData: GameObjectivesData = {
            player1Objectives: [],
            player2Objectives: [],
        };
        const game = new Game();
        chai.spy.on(game, 'getPlayer', () => DEFAULT_PLAYER_1);
        const resetStub = stub(Game['objectivesService'], 'resetPlayerObjectiveProgression').returns(updateData);
        const result = game.resetPlayerObjectiveProgression(DEFAULT_PLAYER_1.id);
        expect(resetStub.called).to.be.true;
        expect(result).to.equal(updateData);
    });
});
