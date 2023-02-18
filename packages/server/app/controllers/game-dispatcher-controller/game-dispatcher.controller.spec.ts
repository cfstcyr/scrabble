/* eslint-disable max-len */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable max-lines */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Application } from '@app/app';
import { GameUpdateData } from '@app/classes/communication/game-update-data';
import Game from '@app/classes/game/game';
import { GameConfig, GameConfigData, StartGameData } from '@app/classes/game/game-config';
import { GameMode } from '@app/classes/game/game-mode';
import { GameType } from '@app/classes/game/game-type';
import Room from '@app/classes/game/room';
import WaitingRoom from '@app/classes/game/waiting-room';
import { HttpException } from '@app/classes/http-exception/http-exception';
import Player from '@app/classes/player/player';
import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
import { Square } from '@app/classes/square';
import { SECONDS_TO_MILLISECONDS, TIME_TO_RECONNECT } from '@app/constants/controllers-constants';
import {
    DICTIONARY_REQUIRED,
    GAME_IS_OVER,
    GAME_MODE_REQUIRED,
    GAME_TYPE_REQUIRED,
    MAX_ROUND_TIME_REQUIRED,
    NAME_IS_INVALID,
    PLAYER_NAME_REQUIRED,
    VIRTUAL_PLAYER_LEVEL_REQUIRED,
    VIRTUAL_PLAYER_NAME_REQUIRED,
} from '@app/constants/controllers-errors';
import { TEST_DICTIONARY } from '@app/constants/dictionary-tests-const';
import { SYSTEM_ID } from '@app/constants/game-constants';
import { VIRTUAL_PLAYER_ID_PREFIX } from '@app/constants/virtual-player-constants';
import { ActiveGameService } from '@app/services/active-game-service/active-game.service';
import { ChatService } from '@app/services/chat-service/chat.service';
import { CreateGameService } from '@app/services/create-game-service/create-game.service';
import { GameDispatcherService } from '@app/services/game-dispatcher-service/game-dispatcher.service';
import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
import { SocketService } from '@app/services/socket-service/socket.service';
import * as chai from 'chai';
import { spy } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import { EventEmitter } from 'events';
import { StatusCodes } from 'http-status-codes';
import * as sinon from 'sinon';
import { createStubInstance, SinonStub, SinonStubbedInstance, stub, useFakeTimers } from 'sinon';
import { Socket } from 'socket.io';
import * as supertest from 'supertest';
import { Container } from 'typedi';
import { GameDispatcherController } from './game-dispatcher.controller';

const expect = chai.expect;

chai.use(spies);
chai.use(chaiAsPromised);

const DEFAULT_GAME_ID = 'gameId';
const DEFAULT_PLAYER_ID = 'playerId';
const DEFAULT_USER_ID = 1;
const DEFAULT_NEW_PLAYER_ID = 'newPlayerId';
const DEFAULT_MAX_ROUND_TIME = 1;

const DEFAULT_PLAYER_NAME = 'player';
const DEFAULT_GAME_CONFIG_DATA: GameConfigData = {
    playerName: DEFAULT_PLAYER_NAME,
    playerId: DEFAULT_PLAYER_ID,
    gameType: GameType.Classic,
    gameMode: GameMode.Multiplayer,
    virtualPlayerLevel: VirtualPlayerLevel.Beginner,
    virtualPlayerName: DEFAULT_PLAYER_NAME,
    maxRoundTime: DEFAULT_MAX_ROUND_TIME,
    dictionary: TEST_DICTIONARY,
};

const DEFAULT_SOLO_GAME_CONFIG_DATA: GameConfigData = {
    playerName: DEFAULT_PLAYER_NAME,
    playerId: DEFAULT_PLAYER_ID,
    gameType: GameType.Classic,
    gameMode: GameMode.Solo,
    virtualPlayerLevel: VirtualPlayerLevel.Beginner,
    virtualPlayerName: DEFAULT_PLAYER_NAME,
    maxRoundTime: DEFAULT_MAX_ROUND_TIME,
    dictionary: TEST_DICTIONARY,
};

const DEFAULT_GAME_CONFIG: GameConfig = {
    player1: new Player(DEFAULT_PLAYER_ID, DEFAULT_PLAYER_NAME),
    gameType: GameType.Classic,
    gameMode: GameMode.Multiplayer,
    maxRoundTime: DEFAULT_MAX_ROUND_TIME,
    dictionary: TEST_DICTIONARY,
};

const DEFAULT_EXCEPTION = 'exception';

// const DEFAULT_PLAYER = new Player(VIRTUAL_PLAYER_ID_PREFIX + DEFAULT_PLAYER_ID, DEFAULT_PLAYER_NAME);
const DEFAULT_JOINED_PLAYER1 = new Player(DEFAULT_PLAYER_ID, DEFAULT_PLAYER_NAME);
const DEFAULT_JOINED_PLAYER2 = new Player(DEFAULT_PLAYER_ID, DEFAULT_PLAYER_NAME);
const DEFAULT_JOINED_PLAYER3 = new Player(DEFAULT_PLAYER_ID, DEFAULT_PLAYER_NAME);

const DEFAULT_STARTING_GAME_DATA: StartGameData = {
    ...DEFAULT_GAME_CONFIG,
    gameId: DEFAULT_GAME_ID,
    board: undefined as unknown as Square[][],
    tileReserve: [],
    round: {
        playerData: {
            id: VIRTUAL_PLAYER_ID_PREFIX + DEFAULT_PLAYER_ID,
        },
        startTime: new Date(),
        limitTime: new Date(),
    },
    player1: DEFAULT_GAME_CONFIG.player1.convertToPlayerData(),
    player2: DEFAULT_JOINED_PLAYER1.convertToPlayerData(),
    player3: DEFAULT_JOINED_PLAYER2.convertToPlayerData(),
    player4: DEFAULT_JOINED_PLAYER3.convertToPlayerData(),
};

describe('GameDispatcherController', () => {
    let controller: GameDispatcherController;
    let createGameServiceStub: SinonStubbedInstance<CreateGameService>;
    let testingUnit: ServicesTestingUnit;

    beforeEach(async () => {
        testingUnit = new ServicesTestingUnit();
        await testingUnit.withMockDatabaseService();
        testingUnit
            .withStubbedDictionaryService()
            .withStubbedControllers(GameDispatcherController)
            .withStubbed(SocketService)
            .withStubbed(ChatService);
        createGameServiceStub = testingUnit.setStubbed(CreateGameService);
    });

    beforeEach(() => {
        controller = Container.get(GameDispatcherController);
    });

    afterEach(() => {
        sinon.restore();
        testingUnit.restore();
    });

    it('should create', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions, no-unused-expressions
        expect(controller).to.exist;
    });

    describe('configureRouter', () => {
        let expressApp: Express.Application;

        beforeEach(() => {
            const app = Container.get(Application);
            expressApp = app.app;
        });

        describe('POST /games/:playerId', () => {
            it('should return CREATED', async () => {
                chai.spy.on(controller, 'handleCreateGame', () => {});

                return await supertest(expressApp).post(`/api/games/${DEFAULT_PLAYER_ID}`).expect(StatusCodes.CREATED);
            });

            it('should return BAD_REQUEST on throw httpException', async () => {
                chai.spy.on(controller, 'handleCreateGame', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.BAD_REQUEST);
                });

                return await supertest(expressApp).post(`/api/games/${DEFAULT_PLAYER_ID}`).expect(StatusCodes.BAD_REQUEST);
            });
        });

        describe('GET /games/:playerId', () => {
            it('should return NO_CONTENT', async () => {
                chai.spy.on(controller, 'handleLobbiesRequest', () => {});

                return await supertest(expressApp).get(`/api/games/${DEFAULT_PLAYER_ID}`).expect(StatusCodes.NO_CONTENT);
            });

            it('should return INTERNAL_SERVER_ERROR on throw httpException', async () => {
                chai.spy.on(controller, 'handleLobbiesRequest', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.INTERNAL_SERVER_ERROR);
                });

                return await supertest(expressApp).get(`/api/games/${DEFAULT_PLAYER_ID}`).expect(StatusCodes.INTERNAL_SERVER_ERROR);
            });
        });

        describe('/games/:gameId/players/:playerId/join', () => {
            it('should return NO_CONTENT', async () => {
                chai.spy.on(controller, 'handleJoinGame', () => {});

                return await supertest(expressApp)
                    .post(`/api/games/${DEFAULT_GAME_ID}/players/${DEFAULT_PLAYER_ID}/join`)
                    .expect(StatusCodes.NO_CONTENT);
            });

            it('should return BAD_REQUEST on throw', async () => {
                chai.spy.on(controller, 'handleJoinGame', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.BAD_REQUEST);
                });

                return await supertest(expressApp)
                    .post(`/api/games/${DEFAULT_GAME_ID}/players/${DEFAULT_PLAYER_ID}/join`)
                    .expect(StatusCodes.BAD_REQUEST);
            });
        });

        describe('/games/:gameId/players/:playerId/accept', () => {
            it('should return NO_CONTENT', async () => {
                chai.spy.on(controller, 'handleAcceptRequest', () => {});

                return await supertest(expressApp)
                    .post(`/api/games/${DEFAULT_GAME_ID}/players/${DEFAULT_PLAYER_ID}/accept`)
                    .expect(StatusCodes.NO_CONTENT);
            });

            it('should return BAD_REQUEST on throw', async () => {
                chai.spy.on(controller, 'handleAcceptRequest', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.BAD_REQUEST);
                });

                return await supertest(expressApp)
                    .post(`/api/games/${DEFAULT_GAME_ID}/players/${DEFAULT_PLAYER_ID}/accept`)
                    .expect(StatusCodes.BAD_REQUEST);
            });
        });

        describe('/games/:gameId/players/:playerId/reject', () => {
            it('should return NO_CONTENT', async () => {
                chai.spy.on(controller, 'handleRejectRequest', () => {});

                return await supertest(expressApp)
                    .post(`/api/games/${DEFAULT_GAME_ID}/players/${DEFAULT_PLAYER_ID}/reject`)
                    .expect(StatusCodes.NO_CONTENT);
            });

            it('should return BAD_REQUEST on throw', async () => {
                chai.spy.on(controller, 'handleRejectRequest', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.BAD_REQUEST);
                });

                return await supertest(expressApp)
                    .post(`/api/games/${DEFAULT_GAME_ID}/players/${DEFAULT_PLAYER_ID}/reject`)
                    .expect(StatusCodes.BAD_REQUEST);
            });
        });

        describe('/games/:gameId/players/:playerId/cancel', () => {
            it('should return NO_CONTENT', async () => {
                chai.spy.on(controller, 'handleCancelGame', () => {});

                return await supertest(expressApp)
                    .delete(`/api/games/${DEFAULT_GAME_ID}/players/${DEFAULT_PLAYER_ID}/cancel`)
                    .expect(StatusCodes.NO_CONTENT);
            });

            it('should return INTERNAL_SERVER_ERROR on throw', async () => {
                chai.spy.on(controller, 'handleCancelGame', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.INTERNAL_SERVER_ERROR);
                });

                return await supertest(expressApp)
                    .delete(`/api/games/${DEFAULT_GAME_ID}/players/${DEFAULT_PLAYER_ID}/cancel`)
                    .expect(StatusCodes.INTERNAL_SERVER_ERROR);
            });
        });

        describe('/games/:gameId/player/:playerId/reconnect', () => {
            it('should return NO_CONTENT', async () => {
                chai.spy.on(controller, 'handleReconnection', () => {});

                return await supertest(expressApp)
                    .post(`/api/games/${DEFAULT_GAME_ID}/players/${DEFAULT_PLAYER_ID}/reconnect`)
                    .expect(StatusCodes.NO_CONTENT);
            });

            it('should return INTERNAL_SERVER_ERROR on throw', async () => {
                chai.spy.on(controller, 'handleReconnection', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.INTERNAL_SERVER_ERROR);
                });

                return await supertest(expressApp)
                    .post(`/api/games/${DEFAULT_GAME_ID}/players/${DEFAULT_PLAYER_ID}/reconnect`)
                    .expect(StatusCodes.INTERNAL_SERVER_ERROR);
            });
        });

        describe('/games/:gameId/player/:playerId/disconnect', () => {
            it('should return NO_CONTENT', async () => {
                chai.spy.on(controller, 'handleDisconnection', () => {});

                return await supertest(expressApp)
                    .delete(`/api/games/${DEFAULT_GAME_ID}/players/${DEFAULT_PLAYER_ID}/disconnect`)
                    .expect(StatusCodes.NO_CONTENT);
            });

            it('should return INTERNAL_SERVER_ERROR on throw', async () => {
                chai.spy.on(controller, 'handleDisconnection', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.INTERNAL_SERVER_ERROR);
                });

                return await supertest(expressApp)
                    .delete(`/api/games/${DEFAULT_GAME_ID}/players/${DEFAULT_PLAYER_ID}/disconnect`)
                    .expect(StatusCodes.INTERNAL_SERVER_ERROR);
            });
        });

        describe('/games/:gameId/player/:playerId/leave', () => {
            it('should return NO_CONTENT', async () => {
                chai.spy.on(controller, 'handleLeave', () => {});

                return await supertest(expressApp)
                    .delete(`/api/games/${DEFAULT_GAME_ID}/players/${DEFAULT_PLAYER_ID}/leave`)
                    .expect(StatusCodes.NO_CONTENT);
            });

            it('should return INTERNAL_SERVER_ERROR on throw', async () => {
                chai.spy.on(controller, 'handleLeave', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.INTERNAL_SERVER_ERROR);
                });

                return await supertest(expressApp)
                    .delete(`/api/games/${DEFAULT_GAME_ID}/players/${DEFAULT_PLAYER_ID}/leave`)
                    .expect(StatusCodes.INTERNAL_SERVER_ERROR);
            });
        });
    });

    describe('handleReconnection', () => {
        let gameStub: SinonStubbedInstance<Game>;
        let getGameSpy: SinonStub;
        let playerStub: SinonStubbedInstance<Player>;
        let opponent: SinonStubbedInstance<Player>;
        let gameDispatcherStub: SinonStubbedInstance<GameDispatcherService>;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let emitToSocketSpy: any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let emitToRoomNoSenderSpy: any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let addToRoomSpy: any;
        let mockStartGameData: StartGameData;

        beforeEach(() => {
            gameStub = createStubInstance(Game);
            gameDispatcherStub = createStubInstance(GameDispatcherService);

            playerStub = createStubInstance(Player);
            playerStub.id = DEFAULT_PLAYER_ID;
            playerStub.isConnected = true;

            opponent = createStubInstance(Player);
            opponent.id = 'opponent-id';

            mockStartGameData = undefined as unknown as StartGameData;
            gameStub.createStartGameData.callsFake(() => mockStartGameData);
            getGameSpy = stub(controller['activeGameService'], 'getGame').returns(gameStub as unknown as Game);
            controller['gameDispatcherService'] = gameDispatcherStub as unknown as GameDispatcherService;
            gameStub.getPlayer
                .onFirstCall()
                .returns(playerStub as unknown as Player)
                .onSecondCall()
                .returns(opponent as unknown as Player);
            emitToSocketSpy = chai.spy.on(controller['socketService'], 'emitToSocket', () => {});
            emitToRoomNoSenderSpy = chai.spy.on(controller['socketService'], 'emitToRoomNoSender', () => {});
            addToRoomSpy = chai.spy.on(controller['socketService'], 'addToRoom', () => {});
            gameStub.areGameOverConditionsMet.returns(false);

            gameStub.getPlayerNumber.returns(1);
        });

        it('should call activeGameService.getGame', () => {
            gameStub.areGameOverConditionsMet.returns(false);
            controller['handleReconnection'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_NEW_PLAYER_ID);
            chai.assert(getGameSpy.calledOnce);
        });

        it('should call isGameOver', () => {
            gameStub.areGameOverConditionsMet.returns(false);
            controller['handleReconnection'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_NEW_PLAYER_ID);
            chai.assert(gameStub.areGameOverConditionsMet.calledOnce);
        });

        it('should throw GAME_IS_OVER, FORBIDDEN if game isGameOver', () => {
            gameStub.areGameOverConditionsMet.returns(true);
            const result = () => controller['handleReconnection'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_NEW_PLAYER_ID);
            expect(result).to.throw(GAME_IS_OVER);
        });

        it('should set Player id to new Id and Connected to true', () => {
            controller['handleReconnection'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_NEW_PLAYER_ID);
            expect(playerStub.id).to.equal(DEFAULT_NEW_PLAYER_ID);
            expect(playerStub.isConnected).to.be.true;
        });

        it('should call addToRoom', () => {
            gameStub.areGameOverConditionsMet.returns(false);
            controller['handleReconnection'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_NEW_PLAYER_ID);
            expect(addToRoomSpy).to.have.been.called();
        });

        it('should createStartGameData', () => {
            gameStub.areGameOverConditionsMet.returns(false);

            controller['handleReconnection'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_NEW_PLAYER_ID);
            chai.assert(gameStub.createStartGameData.calledOnce);
        });

        it('should call emit start game data to reconnected socket', () => {
            gameStub.areGameOverConditionsMet.returns(false);

            controller['handleReconnection'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_NEW_PLAYER_ID);
            expect(emitToSocketSpy).to.have.been.called.with(DEFAULT_NEW_PLAYER_ID, 'startGame', mockStartGameData);
        });

        it('should call emit new id to opponents', () => {
            gameStub.areGameOverConditionsMet.returns(false);

            controller['handleReconnection'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_NEW_PLAYER_ID);
            const updateData: GameUpdateData = { player1: { id: DEFAULT_PLAYER_ID, newId: DEFAULT_NEW_PLAYER_ID } };
            expect(emitToRoomNoSenderSpy).to.have.been.called.with(DEFAULT_GAME_ID, DEFAULT_NEW_PLAYER_ID, 'gameUpdate', updateData);
        });

        it("should connect user to the game's chat room", () => {
            const expectedChannelId = 1;
            gameStub.getGroupChannelId.returns(expectedChannelId);

            const chatServiceStub = testingUnit.getStubbedInstance(ChatService);
            chatServiceStub.joinChannel.callsFake(async () => {});

            controller['handleReconnection'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_NEW_PLAYER_ID);
            expect(chatServiceStub.joinChannel.calledWith(expectedChannelId, DEFAULT_PLAYER_ID)).to.be.true;
        });
    });

    describe('handleCreateGame', () => {
        beforeEach(() => {
            createGameServiceStub.createSoloGame.resolves(DEFAULT_STARTING_GAME_DATA);
        });

        it('should call createSoloGame', async () => {
            const createGameServiceSpy = chai.spy.on(controller, 'handleCreateSoloGame', () => {
                return;
            });
            await controller['handleCreateGame'](DEFAULT_SOLO_GAME_CONFIG_DATA, DEFAULT_USER_ID);
            expect(createGameServiceSpy).to.have.been.called();
        });

        it('should call createMultiplayerGame', () => {
            const createGameServiceSpy = chai.spy.on(controller, 'handleCreateMultiplayerGame', () => DEFAULT_GAME_ID);
            controller['handleCreateGame'](DEFAULT_GAME_CONFIG_DATA, DEFAULT_USER_ID);
            expect(createGameServiceSpy).to.have.been.called();
        });

        it('should throw if config.playerName is undefined', () => {
            const config = { ...DEFAULT_GAME_CONFIG_DATA, playerName: undefined, virtualPlayerLevel: VirtualPlayerLevel.Expert };
            expect(controller['handleCreateGame'](config as unknown as GameConfigData, DEFAULT_USER_ID)).to.be.rejectedWith(PLAYER_NAME_REQUIRED);
        });

        it('should throw if config.gameType is undefined', () => {
            const config = { ...DEFAULT_GAME_CONFIG_DATA, gameType: undefined };
            expect(controller['handleCreateGame'](config as unknown as GameConfigData, DEFAULT_USER_ID)).to.be.rejectedWith(GAME_TYPE_REQUIRED);
        });

        it('should throw if config.gameMode is undefined', () => {
            const config = { ...DEFAULT_GAME_CONFIG_DATA, gameMode: undefined };
            expect(controller['handleCreateGame'](config as unknown as GameConfigData, DEFAULT_USER_ID)).to.be.rejectedWith(GAME_MODE_REQUIRED);
        });

        it('should throw if config.maxRoundTime is undefined', () => {
            const config = { ...DEFAULT_GAME_CONFIG_DATA, maxRoundTime: undefined };
            expect(controller['handleCreateGame'](config as unknown as GameConfigData, DEFAULT_USER_ID)).to.be.rejectedWith(MAX_ROUND_TIME_REQUIRED);
        });

        it('should throw if config.dictionary is undefined', () => {
            const config = { ...DEFAULT_GAME_CONFIG_DATA, dictionary: undefined };
            expect(controller['handleCreateGame'](config as unknown as GameConfigData, DEFAULT_USER_ID)).to.be.rejectedWith(DICTIONARY_REQUIRED);
        });

        it('should throw if config.playerName is invalid', () => {
            const playerName = '     ';
            const config = { ...DEFAULT_GAME_CONFIG_DATA, playerName };
            expect(controller['handleCreateGame'](config as unknown as GameConfigData, DEFAULT_USER_ID)).to.be.rejectedWith(NAME_IS_INVALID);
        });

        it('should throw if config.virtualPlayerName is undefined with solo game', () => {
            const config = { ...DEFAULT_GAME_CONFIG_DATA, gameMode: GameMode.Solo, virtualPlayerName: undefined };
            expect(controller['handleCreateGame'](config as unknown as GameConfigData, DEFAULT_USER_ID)).to.be.rejectedWith(
                VIRTUAL_PLAYER_NAME_REQUIRED,
            );
        });

        it('should throw if config.virtualPlayerLevel is undefined with solo game', () => {
            const config = { ...DEFAULT_GAME_CONFIG_DATA, gameMode: GameMode.Solo, virtualPlayerLevel: undefined };
            expect(controller['handleCreateGame'](config as unknown as GameConfigData, DEFAULT_USER_ID)).to.be.rejectedWith(
                VIRTUAL_PLAYER_LEVEL_REQUIRED,
            );
        });
    });

    describe('handleCreateSoloGame', () => {
        let createSoloGameSpy: unknown;
        beforeEach(() => {
            createSoloGameSpy = spy.on(controller['gameDispatcherService'], 'createSoloGame', () => {
                return;
            });
        });

        afterEach(() => {
            chai.spy.restore();
        });

        it('should call createSoloGame', async () => {
            await controller['handleCreateGame'](DEFAULT_SOLO_GAME_CONFIG_DATA, DEFAULT_USER_ID);
            expect(createSoloGameSpy).to.have.been.called();
        });
    });

    describe('handleCreateMultiplayerGame', () => {
        let createGameServiceSpy: unknown;
        let handleLobbesUpdateSpy: unknown;
        beforeEach(() => {
            createGameServiceSpy = chai.spy.on(controller['gameDispatcherService'], 'createMultiplayerGame', () => {
                return;
            });
            handleLobbesUpdateSpy = spy.on(controller, 'handleLobbiesUpdate', () => {
                return;
            });
        });

        afterEach(() => {
            chai.spy.restore();
        });

        it('should call createMultiplayerGame', async () => {
            await controller['handleCreateMultiplayerGame'](DEFAULT_SOLO_GAME_CONFIG_DATA, DEFAULT_USER_ID);
            expect(createGameServiceSpy).to.have.been.called();
        });

        it('should call handleLobbiesUpdate', async () => {
            await controller['handleCreateMultiplayerGame'](DEFAULT_SOLO_GAME_CONFIG_DATA, DEFAULT_USER_ID);
            expect(handleLobbesUpdateSpy).to.have.been.called();
        });
    });

    describe('handleJoinGame', () => {
        let emitSpy: unknown;
        let requestSpy: unknown;

        beforeEach(() => {
            emitSpy = chai.spy.on(controller['socketService'], 'emitToRoom', () => {});
            requestSpy = chai.spy.on(controller['gameDispatcherService'], 'requestJoinGame', () => {});
            chai.spy.on(controller, 'handleLobbiesUpdate', () => {});
            const stubSocket = createStubInstance(Socket);
            stubSocket.leave.returns();
            chai.spy.on(controller['socketService'], 'getSocket', () => {
                return stubSocket;
            });
        });

        it('should call socketService.emitToRoom', () => {
            controller['handleJoinGame'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_PLAYER_NAME);
            expect(emitSpy).to.have.been.called();
        });

        it('should call gameDispatcherService.requestJoinGame', () => {
            controller['handleJoinGame'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_PLAYER_NAME);
            expect(requestSpy).to.have.been.called();
        });

        it('should throw if playerName is undefined', () => {
            expect(() => {
                controller['handleJoinGame'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, undefined as unknown as string);
            }).to.throw(PLAYER_NAME_REQUIRED);
        });

        it('should throw if playerName is invalid', () => {
            const playerName = '     ';
            expect(() => {
                controller['handleJoinGame'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, playerName);
            }).to.throw(NAME_IS_INVALID);
        });
    });

    // TODO: Fix tests when we change game start logic
    // describe('handleAcceptRequest', () => {
    //     let beginGameSpy: unknown;
    //     let acceptSpy: unknown;
    //     let addToRoomSpy: unknown;
    //     let emitToRoomSpy: unknown;

    //     beforeEach(() => {
    //         beginGameSpy = chai.spy.on(controller['activeGameService'], 'beginGame', async () => {
    //             return Promise.resolve({ player2: DEFAULT_PLAYER });
    //         });
    //         acceptSpy = chai.spy.on(controller['gameDispatcherService'], 'acceptJoinRequest', async () => {
    //             return Promise.resolve({ player2: { getId: () => DEFAULT_PLAYER_ID } });
    //         });
    //         addToRoomSpy = chai.spy.on(controller['socketService'], 'addToRoom', () => {});
    //         emitToRoomSpy = chai.spy.on(controller['socketService'], 'emitToRoom', () => {});
    //     });

    //     it('should call gameDispatcherService.acceptJoinRequest', async () => {
    //         await controller['handleAcceptRequest'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_PLAYER_NAME);
    //         expect(acceptSpy).to.have.been.called();
    //     });

    //     it('should call activeGameService.beginMultiplayerGame', async () => {
    //         await controller['handleAcceptRequest'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_PLAYER_NAME);
    //         expect(beginGameSpy).to.have.been.called();
    //     });

    //     it('should call socketService.addToRoom', async () => {
    //         await controller['handleAcceptRequest'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_PLAYER_NAME);
    //         expect(addToRoomSpy).to.have.been.called();
    //     });

    //     it('should call socketService.emitToRoom', async () => {
    //         await controller['handleAcceptRequest'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_PLAYER_NAME);
    //         expect(emitToRoomSpy).to.have.been.called();
    //     });

    //     it('should throw if playerName is undefined', () => {
    //         // eslint-disable-next-line @typescript-eslint/no-unused-expressions, no-unused-expressions
    //         expect(controller['handleAcceptRequest'](DEFAULT_GAME_ID, DEFAULT_PLAYER_NAME, undefined as unknown as string)).to.eventually.be.rejected;
    //     });
    // });

    describe('handleRejectRequest', () => {
        let rejectSpy: unknown;
        let emitToSocketSpy: unknown;
        const player = new Player('id', 'name');
        const hostName = 'hostName';

        beforeEach(() => {
            rejectSpy = chai.spy.on(controller['gameDispatcherService'], 'rejectJoinRequest', () => [player, hostName]);
            emitToSocketSpy = chai.spy.on(controller['socketService'], 'emitToSocket', () => {});
        });

        it('should call gameDispatcherService.rejectJoinRequest', () => {
            chai.spy.on(controller, 'handleLobbiesUpdate', () => {});
            controller['handleRejectRequest'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_PLAYER_NAME);
            expect(rejectSpy).to.have.been.called();
        });

        it('should call gameDispatcherService.rejectJoinRequest', () => {
            chai.spy.on(controller, 'handleLobbiesUpdate', () => {});
            controller['handleRejectRequest'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_PLAYER_NAME);
            expect(emitToSocketSpy).to.have.been.called();
        });

        it('should throw if playerName is undefined', () => {
            expect(() => controller['handleRejectRequest'](DEFAULT_GAME_ID, DEFAULT_PLAYER_NAME, undefined as unknown as string)).to.throw();
        });
    });

    describe('handleLobbiesRequest', () => {
        let getAvailableRoomsSpy: unknown;
        let addToRoomSpy: unknown;
        let emitToSocketSpy: unknown;
        const lobbyStub = createStubInstance(Room);
        lobbyStub.getId.returns('1');

        beforeEach(() => {
            chai.spy.on(controller['gameDispatcherService'], 'getLobbiesRoom', () => lobbyStub);
            getAvailableRoomsSpy = chai.spy.on(controller['gameDispatcherService'], 'getAvailableWaitingRooms', () => lobbyStub);
            addToRoomSpy = chai.spy.on(controller['socketService'], 'addToRoom', () => {});
            emitToSocketSpy = chai.spy.on(controller['socketService'], 'emitToSocket', () => {});
            controller['handleLobbiesRequest'](DEFAULT_PLAYER_ID);
        });

        it('should call gameDispatcherService.getAvailableWaitingRooms', () => {
            expect(getAvailableRoomsSpy).to.have.been.called();
        });

        it('should call socketService.addToRoom', () => {
            expect(addToRoomSpy).to.have.been.called.with(DEFAULT_PLAYER_ID, lobbyStub.getId());
        });

        it('should call socketService.emitToSocket', () => {
            expect(emitToSocketSpy).to.have.been.called();
        });
    });

    describe('handleCancelGame', () => {
        let getGameFromIdSpy: unknown;
        let emitToRoomNoSenderSpy: unknown;
        let cancelGameSpy: unknown;
        let handleLobbiesUpdateSpy: unknown;
        const waitingRoomStub = createStubInstance(WaitingRoom);

        beforeEach(() => {
            getGameFromIdSpy = chai.spy.on(controller['gameDispatcherService'], 'getMultiplayerGameFromId', () => {
                return waitingRoomStub;
            });
            emitToRoomNoSenderSpy = chai.spy.on(controller['socketService'], 'emitToRoomNoSender', () => {});
            cancelGameSpy = chai.spy.on(controller['gameDispatcherService'], 'cancelGame', () => {});
            handleLobbiesUpdateSpy = chai.spy.on(controller, 'handleLobbiesUpdate', () => {});
            waitingRoomStub.joinedPlayer2 = DEFAULT_JOINED_PLAYER1;
            waitingRoomStub.joinedPlayer3 = DEFAULT_JOINED_PLAYER2;
            waitingRoomStub.joinedPlayer4 = DEFAULT_JOINED_PLAYER3;
            chai.spy.on(waitingRoomStub, 'getConfig', () => {
                return { player1: new Player(DEFAULT_PLAYER_ID, DEFAULT_PLAYER_NAME) };
            });
        });

        afterEach(() => {
            chai.spy.restore();
        });

        it('should call gameDispatcherService.getMultiplayerGameFromId', async () => {
            await controller['handleCancelGame'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID);
            expect(getGameFromIdSpy).to.have.been.called.with(DEFAULT_GAME_ID);
        });

        it('should call socketService.emitToSocket', () => {
            waitingRoomStub.joinedPlayer2 = new Player(DEFAULT_PLAYER_ID, DEFAULT_PLAYER_NAME);
            controller['handleCancelGame'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID);
            expect(emitToRoomNoSenderSpy).to.have.been.called();
        });

        it('should call gameDispatcherService.cancelGame', () => {
            controller['handleCancelGame'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID);
            expect(cancelGameSpy).to.have.been.called.with(DEFAULT_GAME_ID, DEFAULT_PLAYER_ID);
        });

        it('should call handleLobbiesUpdate', async () => {
            await controller['handleCancelGame'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID);
            expect(handleLobbiesUpdateSpy).to.have.been.called();
        });
    });

    describe('handleLeave', () => {
        let isGameInWaitingRoomsSpy: unknown;
        let emitToSocketSpy: unknown;
        let activeGameServiceStub: SinonStubbedInstance<ActiveGameService>;
        let gameStub: SinonStubbedInstance<Game>;
        let player: Player;

        beforeEach(() => {
            emitToSocketSpy = chai.spy.on(controller['socketService'], 'emitToSocket', () => {});

            activeGameServiceStub = createStubInstance(ActiveGameService);
            gameStub = createStubInstance(Game);
            player = new Player(DEFAULT_PLAYER_ID, DEFAULT_PLAYER_NAME);

            (controller['activeGameService'] as unknown) = activeGameServiceStub;
            activeGameServiceStub.getGame.returns(gameStub as unknown as Game);
            activeGameServiceStub.playerLeftEvent = new EventEmitter();
            gameStub.getPlayer.returns(player);
        });

        describe('Player leave before game', () => {
            let leaveLobbyRequestSpy: unknown;
            let handleLobbiesUpdateSpy: unknown;

            beforeEach(async () => {
                isGameInWaitingRoomsSpy = chai.spy.on(controller['gameDispatcherService'], 'isGameInWaitingRooms', () => {
                    return true;
                });
                leaveLobbyRequestSpy = chai.spy.on(controller['gameDispatcherService'], 'leaveLobbyRequest', async () => {
                    return [DEFAULT_PLAYER_ID, DEFAULT_PLAYER_NAME];
                });
                handleLobbiesUpdateSpy = chai.spy.on(controller, 'handleLobbiesUpdate', () => {});
                await controller['handleLeave'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID);
            });

            it('should call gameDispatcherService.isGameInWaitingRoomsSpy', () => {
                expect(isGameInWaitingRoomsSpy).to.have.been.called();
            });

            it('should call gameDispatcherService.leaveLobbyRequest', () => {
                expect(leaveLobbyRequestSpy).to.have.been.called.with(DEFAULT_GAME_ID, DEFAULT_PLAYER_ID);
            });

            it('should call socketService.emitToSocket', () => {
                expect(emitToSocketSpy).to.have.been.called();
            });

            it('should call handleLobbiesUpdate', () => {
                expect(handleLobbiesUpdateSpy).to.have.been.called();
            });
        });

        describe('Player leave during game', () => {
            it('should call handlePlayerLeaves on ActiveGameService', () => {
                activeGameServiceStub.handlePlayerLeaves.callsFake(async () => {});

                controller['handleLeave'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID);

                expect(activeGameServiceStub.handlePlayerLeaves.calledWith(DEFAULT_GAME_ID, DEFAULT_PLAYER_ID));
            });
        });
    });

    describe('handleLobbiesUpdate', () => {
        let getAvailableRoomsSpy: unknown;
        let emitToRoomSpy: unknown;
        let getLobbiesRoomSpy: unknown;
        const lobbyRoomStub = createStubInstance(Room);

        beforeEach(() => {
            getAvailableRoomsSpy = chai.spy.on(controller['gameDispatcherService'], 'getAvailableWaitingRooms', () => {});
            emitToRoomSpy = chai.spy.on(controller['socketService'], 'emitToRoom', () => {});
            getLobbiesRoomSpy = chai.spy.on(controller['gameDispatcherService'], 'getLobbiesRoom', () => {
                return lobbyRoomStub;
            });
            controller['handleLobbiesUpdate']();
        });

        it('should call gameDispatcherService.getAvailableWaitingRooms', () => {
            expect(getAvailableRoomsSpy).to.have.been.called();
        });

        it('should call socketService.emitToRoom', () => {
            expect(emitToRoomSpy).to.have.been.called();
        });

        it('should call gameDispatcherService.getLobbiesRoom', () => {
            expect(getLobbiesRoomSpy).to.have.been.called();
        });
    });

    describe('handleDisconnection', () => {
        let gameStub: SinonStubbedInstance<Game>;
        let getGameSpy: SinonStub;
        let gameIsOverSpy: unknown;
        let playerStub: SinonStubbedInstance<Player>;
        let handleLeaveSpy: unknown;

        beforeEach(() => {
            gameStub = createStubInstance(Game);
            getGameSpy = stub(controller['activeGameService'], 'getGame').returns(gameStub as unknown as Game);
            playerStub = createStubInstance(Player);
            gameStub.getPlayer.returns(playerStub as unknown as Player);
            handleLeaveSpy = chai.spy.on(controller, 'handleLobbyLeave', () => {});
        });

        it("should disconnect user from game's chat room", () => {
            const expectedChannelId = 1;
            gameStub.getGroupChannelId.returns(expectedChannelId);

            const chatServiceStub = testingUnit.getStubbedInstance(ChatService);
            chatServiceStub.quitChannel.callsFake(async () => {});

            controller['handleDisconnection'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID);

            expect(chatServiceStub.quitChannel.calledWith(expectedChannelId, DEFAULT_PLAYER_ID)).to.be.true;
        });

        it('Disconnection should verify if game is over', () => {
            gameIsOverSpy = chai.spy.on(gameStub, 'areGameOverConditionsMet', () => true);
            controller['handleDisconnection'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID);
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions, no-unused-expressions
            expect(getGameSpy.calledOnce).to.be.true;
            expect(gameIsOverSpy).to.have.been.called();
        });

        it('Disconnection should set player isConnected to false if the game is not over', () => {
            const clock = useFakeTimers();

            gameIsOverSpy = chai.spy.on(gameStub, 'areGameOverConditionsMet', () => false);
            controller['handleDisconnection'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID);

            // eslint-disable-next-line @typescript-eslint/no-unused-expressions, no-unused-expressions
            expect(playerStub.isConnected).to.be.false;

            clock.tick(TIME_TO_RECONNECT * SECONDS_TO_MILLISECONDS);
            clock.restore();
        });

        it('Disconnection should force player to leave if they are not reconnected after 5 seconds', () => {
            const clock = useFakeTimers();
            gameIsOverSpy = chai.spy.on(gameStub, 'areGameOverConditionsMet', () => false);
            controller['handleDisconnection'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID);
            expect(handleLeaveSpy).to.not.have.been.called();

            clock.tick(TIME_TO_RECONNECT * SECONDS_TO_MILLISECONDS);
            clock.restore();
        });

        it('Disconnection should keep player in game if they reconnect within 5 seconds', () => {
            const clock = useFakeTimers();
            gameIsOverSpy = chai.spy.on(gameStub, 'areGameOverConditionsMet', () => false);
            controller['handleDisconnection'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID);
            expect(handleLeaveSpy).to.not.have.been.called();
            playerStub.isConnected = true;

            clock.tick(TIME_TO_RECONNECT * SECONDS_TO_MILLISECONDS);
            expect(handleLeaveSpy).to.not.have.been.called.with(DEFAULT_GAME_ID, DEFAULT_PLAYER_ID);
            clock.restore();
        });
    });

    describe('PlayerLeftFeedback', () => {
        it('On receive player feedback, should call handlePlayerFeedback method', () => {
            const handlePlayerFeedbackSpy = chai.spy.on(controller, 'handlePlayerLeftFeedback', () => {});
            const messages: string[] = ['test'];
            const updatedData: GameUpdateData = {};
            controller['activeGameService'].playerLeftEvent.emit('playerLeftFeedback', DEFAULT_GAME_ID, messages, updatedData);
            expect(handlePlayerFeedbackSpy).to.have.been.called.with(DEFAULT_GAME_ID, messages, updatedData);
        });

        it('PlayerLeftFeedback shoud emit game update to room', () => {
            const emitToRoomSpy = chai.spy.on(controller['socketService'], 'emitToRoom', () => {});
            const messages: string[] = ['test'];
            const updatedData: GameUpdateData = {};
            controller['handlePlayerLeftFeedback'](DEFAULT_GAME_ID, messages, updatedData);
            expect(emitToRoomSpy).to.have.been.called.with(DEFAULT_GAME_ID, 'gameUpdate', updatedData);
        });

        it('PlayerLeftFeedback shoud emit end game messages to room', () => {
            const emitToRoomSpy = chai.spy.on(controller['socketService'], 'emitToRoom', () => {});
            const messages: string[] = ['test', 'test2', 'test3'];
            const updatedData: GameUpdateData = {};
            controller['handlePlayerLeftFeedback'](DEFAULT_GAME_ID, messages, updatedData);
            expect(emitToRoomSpy).to.have.been.called.with(DEFAULT_GAME_ID, 'newMessage', {
                content: messages.join('<br>'),
                senderId: SYSTEM_ID,
                gameId: DEFAULT_GAME_ID,
            });
        });
    });
});
