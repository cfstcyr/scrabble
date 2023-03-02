/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import Game from '@app/classes/game/game';
import { ReadyGameConfig } from '@app/classes/game/game-config';
import Player from '@app/classes/player/player';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import { PLAYER_LEFT_GAME } from '@app/constants/controllers-errors';
import { ActiveGameService } from './active-game.service';
import { INVALID_PLAYER_ID_FOR_GAME, NO_GAME_FOUND_WITH_ID } from '@app/constants/services-errors';
import { SinonStubbedInstance } from 'sinon';
import { ChatService } from '@app/services/chat-service/chat.service';
import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
import * as Sinon from 'sinon';
import { Container } from 'typedi';
import { GameVisibility } from '@common/models/game-visibility';
import { VirtualPlayerLevel } from '@common/models/virtual-player-level';
import { DictionarySummary } from '@app/classes/communication/dictionary-data';

const expect = chai.expect;

chai.use(spies);
chai.use(chaiAsPromised);

const USER1 = { username: 'user1', email: 'email1', avatar: 'avatar1' };
const USER2 = { username: 'user2', email: 'email2', avatar: 'avatar2' };
const USER3 = { username: 'user3', email: 'email3', avatar: 'avatar3' };
const USER4 = { username: 'user4', email: 'email4', avatar: 'avatar4' };

const DEFAULT_PLAYER_1 = new Player('id1', USER1);
const DEFAULT_PLAYER_2 = new Player('id2', USER2);
const DEFAULT_PLAYER_3 = new Player('id3', USER3);
const DEFAULT_PLAYER_4 = new Player('id4', USER4);
const DEFAULT_ID = 'gameId';
const DEFAULT_GAME_CHANNEL_ID = 1;
const DEFAULT_MULTIPLAYER_CONFIG: ReadyGameConfig = {
    player1: DEFAULT_PLAYER_1,
    player2: DEFAULT_PLAYER_2,
    player3: DEFAULT_PLAYER_3,
    player4: DEFAULT_PLAYER_4,
    maxRoundTime: 1,
    gameVisibility: GameVisibility.Private,
    virtualPlayerLevel: VirtualPlayerLevel.Beginner,
    dictionarySummary: {} as unknown as DictionarySummary,
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
    let testingUnit: ServicesTestingUnit;

    beforeEach(() => {
        testingUnit = new ServicesTestingUnit().withStubbed(ChatService);
    });

    beforeEach(async () => {
        activeGameService = Container.get(ActiveGameService);
    });

    afterEach(async () => {
        chai.spy.restore();
        Sinon.restore();
        testingUnit.restore();
    });

    afterEach(() => {
        chai.spy.restore();
        testingUnit.restore();
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
            await activeGameService.beginGame(DEFAULT_ID, DEFAULT_GAME_CHANNEL_ID, DEFAULT_MULTIPLAYER_CONFIG);
            expect(activeGameService['activeGames']).to.have.lengthOf(1);
        });

        it('should call Game.createGame', async () => {
            await activeGameService.beginGame(DEFAULT_ID, DEFAULT_GAME_CHANNEL_ID, DEFAULT_MULTIPLAYER_CONFIG);
            expect(spy).to.have.been.called();
        });
    });

    describe('getGame', () => {
        beforeEach(async () => {
            chai.spy.on(Game, 'createMultiplayerGame', async () => Promise.resolve(DEFAULT_GAME));
            await activeGameService.beginGame(DEFAULT_ID, DEFAULT_GAME_CHANNEL_ID, DEFAULT_MULTIPLAYER_CONFIG);
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
            await activeGameService.beginGame(DEFAULT_ID, DEFAULT_GAME_CHANNEL_ID, DEFAULT_MULTIPLAYER_CONFIG);
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

    describe('handlePlayerLeaves', () => {
        let gameStub: SinonStubbedInstance<Game>;
        let emitToSocketSpy: unknown;
        let emitToRoomSpy: unknown;
        let removeFromRoomSpy: unknown;
        let doesRoomExistSpy: unknown;
        let isGameOverSpy: unknown;
        let removeGameSpy: unknown;
        let playerLeftEventSpy: unknown;
        let chatServiceStub: SinonStubbedInstance<ChatService>;

        beforeEach(() => {
            gameStub = Sinon.createStubInstance(Game);
            gameStub.getPlayer.returns(DEFAULT_PLAYER_1);
            Sinon.stub(activeGameService, 'getGame').returns(gameStub as unknown as Game);
            emitToSocketSpy = chai.spy.on(activeGameService['socketService'], 'emitToSocket', () => {});
            emitToRoomSpy = chai.spy.on(activeGameService['socketService'], 'emitToRoom', () => {});
            removeFromRoomSpy = chai.spy.on(activeGameService['socketService'], 'removeFromRoom', () => {});
            removeGameSpy = chai.spy.on(activeGameService, 'removeGame', () => {});
            chatServiceStub = testingUnit.getStubbedInstance(ChatService);
            chatServiceStub.quitChannel.callsFake(async () => {});
        });

        it("should disconnect user from group's channel", async () => {
            gameStub.getGroupChannelId.returns(DEFAULT_GAME_CHANNEL_ID);

            await activeGameService['handlePlayerLeaves'](DEFAULT_ID, DEFAULT_PLAYER_1.id);
            expect(chatServiceStub.quitChannel.calledWith(gameStub.getGroupChannelId(), DEFAULT_PLAYER_1.id)).to.be.true;
        });

        it('should remove player who leaves from socket room', async () => {
            doesRoomExistSpy = chai.spy.on(activeGameService['socketService'], 'doesRoomExist', () => true);

            await activeGameService['handlePlayerLeaves'](DEFAULT_ID, DEFAULT_PLAYER_1.id);
            expect(removeFromRoomSpy).to.have.been.called();
        });

        it('should emit cleanup event to socket', async () => {
            doesRoomExistSpy = chai.spy.on(activeGameService['socketService'], 'doesRoomExist', () => true);
            await activeGameService['handlePlayerLeaves'](DEFAULT_ID, DEFAULT_PLAYER_1.id);
            expect(emitToSocketSpy).to.have.been.called();
        });

        it('should remove game from active game activeGameService if there is no more player in room', async () => {
            doesRoomExistSpy = chai.spy.on(activeGameService['socketService'], 'doesRoomExist', () => false);

            await activeGameService['handlePlayerLeaves'](DEFAULT_ID, DEFAULT_PLAYER_1.id);
            expect(doesRoomExistSpy).to.have.been.called();
            expect(removeGameSpy).to.have.been.called.with(DEFAULT_ID, DEFAULT_PLAYER_1.id);
        });

        it('should not emit player left event if the game is over', async () => {
            doesRoomExistSpy = chai.spy.on(activeGameService['socketService'], 'doesRoomExist', () => true);
            isGameOverSpy = chai.spy.on(activeGameService, 'isGameOver', () => true);
            playerLeftEventSpy = chai.spy.on(activeGameService.playerLeftEvent, 'emit', () => {});

            await activeGameService['handlePlayerLeaves'](DEFAULT_ID, DEFAULT_PLAYER_1.id);
            expect(isGameOverSpy).to.have.been.called();
            expect(playerLeftEventSpy).to.not.have.been.called();
        });

        it('should emit player left event if the game is still ongoing', async () => {
            doesRoomExistSpy = chai.spy.on(activeGameService['socketService'], 'doesRoomExist', () => true);
            isGameOverSpy = chai.spy.on(activeGameService, 'isGameOver', () => false);
            playerLeftEventSpy = chai.spy.on(activeGameService.playerLeftEvent, 'emit', () => {});

            await activeGameService['handlePlayerLeaves'](DEFAULT_ID, DEFAULT_PLAYER_1.id);
            expect(playerLeftEventSpy).to.have.been.called.with('playerLeftGame', DEFAULT_ID, DEFAULT_PLAYER_1.id);
        });

        it('should send message explaining the user left with new VP message if game is NOT over', async () => {
            doesRoomExistSpy = chai.spy.on(activeGameService['socketService'], 'doesRoomExist', () => true);
            isGameOverSpy = chai.spy.on(activeGameService, 'isGameOver', () => false);
            playerLeftEventSpy = chai.spy.on(activeGameService.playerLeftEvent, 'emit', () => {});

            await activeGameService['handlePlayerLeaves'](DEFAULT_ID, DEFAULT_PLAYER_1.id);
            const expectedArg = {
                content: `${DEFAULT_PLAYER_1.publicUser.username} ${PLAYER_LEFT_GAME(false)}`,
                senderId: 'system',
                gameId: DEFAULT_ID,
            };
            expect(emitToRoomSpy).to.have.been.called.with(DEFAULT_ID, 'newMessage', expectedArg);
        });

        it('should send message explaining the user left without VP message if game IS over', async () => {
            doesRoomExistSpy = chai.spy.on(activeGameService['socketService'], 'doesRoomExist', () => true);
            isGameOverSpy = chai.spy.on(activeGameService, 'isGameOver', () => true);
            playerLeftEventSpy = chai.spy.on(activeGameService.playerLeftEvent, 'emit', () => {});

            await activeGameService['handlePlayerLeaves'](DEFAULT_ID, DEFAULT_PLAYER_1.id);
            const expectedArg = {
                content: `${DEFAULT_PLAYER_1.publicUser.username} ${PLAYER_LEFT_GAME(true)}`,
                senderId: 'system',
                gameId: DEFAULT_ID,
            };
            expect(emitToRoomSpy).to.have.been.called.with(DEFAULT_ID, 'newMessage', expectedArg);
        });
    });
});
