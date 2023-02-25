/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-len */
/* eslint-disable max-lines */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-unused-expressions, no-unused-expressions */

import Game from '@app/classes/game/game';
import { GameConfig, GameConfigData, StartGameData } from '@app/classes/game/game-config';
import { GameMode } from '@app/classes/game/game-mode';
import { GameType } from '@app/classes/game/game-type';
import WaitingRoom from '@app/classes/game/waiting-room';
import Player from '@app/classes/player/player';
import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
import { Square } from '@app/classes/square';
import { TileReserve } from '@app/classes/tile';
import { TEST_DICTIONARY } from '@app/constants/dictionary-tests-const';
import { CANNOT_HAVE_SAME_NAME, INVALID_PLAYER_ID_FOR_GAME, NO_GAME_FOUND_WITH_ID } from '@app/constants/services-errors';
import { VIRTUAL_PLAYER_ID_PREFIX } from '@app/constants/virtual-player-constants';
import { ActiveGameService } from '@app/services/active-game-service/active-game.service';
import { CreateGameService } from '@app/services/create-game-service/create-game.service';
import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
import { SocketService } from '@app/services/socket-service/socket.service';
import { VirtualPlayerService } from '@app/services/virtual-player-service/virtual-player.service';
import * as chai from 'chai';
import { spy } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import * as sinon from 'sinon';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { Container } from 'typedi';
import { ChatService } from '@app/services/chat-service/chat.service';
import { GameDispatcherService } from './game-dispatcher.service';

const expect = chai.expect;

const DEFAULT_USER_ID = 1;
const DEFAULT_PLAYER_NAME1 = 'newKidOnTheBlock1';
const DEFAULT_PLAYER_ID1 = 'id1';
const DEFAULT_PLAYER_NAME2 = 'newKidOnTheBlock2';
const DEFAULT_PLAYER_ID2 = 'id';
const DEFAULT_PLAYER_NAME3 = 'newKidOnTheBlock3';
const DEFAULT_PLAYER_ID3 = 'id3';
const DEFAULT_GAME_ID = 'gameId';
const DEFAULT_GAME_CHANNEL_ID = 1;
const DEFAULT_OPPONENT_ID = 'opponent_id';
const DEFAULT_OPPONENT_NAME = 'opponent';
const DEFAULT_ROUND_TIME = 1;

const DEFAULT_OPPONENT = new Player(DEFAULT_OPPONENT_ID, DEFAULT_OPPONENT_NAME);

const DEFAULT_SOLO_GAME_CONFIG_DATA: GameConfigData = {
    playerName: DEFAULT_PLAYER_NAME1,
    playerId: DEFAULT_PLAYER_ID1,
    gameType: GameType.Classic,
    gameMode: GameMode.Solo,
    virtualPlayerLevel: VirtualPlayerLevel.Beginner,
    maxRoundTime: DEFAULT_ROUND_TIME,
    dictionary: TEST_DICTIONARY,
};

const DEFAULT_GAME_CONFIG: GameConfig = {
    player1: new Player(DEFAULT_PLAYER_ID1, DEFAULT_PLAYER_NAME1),
    gameType: GameType.Classic,
    gameMode: GameMode.Multiplayer,
    maxRoundTime: DEFAULT_ROUND_TIME,
    dictionary: TEST_DICTIONARY,
};

const DEFAULT_JOINED_PLAYER1 = new Player(DEFAULT_PLAYER_ID1, DEFAULT_PLAYER_NAME1);
const DEFAULT_JOINED_PLAYER2 = new Player(DEFAULT_PLAYER_ID2, DEFAULT_PLAYER_NAME2);
const DEFAULT_JOINED_PLAYER3 = new Player(DEFAULT_PLAYER_ID3, DEFAULT_PLAYER_NAME3);

const DEFAULT_START_GAME_DATA: StartGameData = {
    ...DEFAULT_GAME_CONFIG,
    gameId: DEFAULT_GAME_ID,
    board: undefined as unknown as Square[][],
    tileReserve: [],
    round: {
        playerData: {
            id: VIRTUAL_PLAYER_ID_PREFIX + DEFAULT_PLAYER_ID1,
        },
        startTime: new Date(),
        limitTime: new Date(),
    },
    player1: DEFAULT_GAME_CONFIG.player1.convertToPlayerData(),
    player2: DEFAULT_JOINED_PLAYER1.convertToPlayerData(),
    player3: DEFAULT_JOINED_PLAYER2.convertToPlayerData(),
    player4: DEFAULT_JOINED_PLAYER3.convertToPlayerData(),
};

const DEFAULT_MULTIPLAYER_CONFIG_DATA: GameConfigData = {
    playerId: DEFAULT_PLAYER_ID1,
    playerName: DEFAULT_PLAYER_NAME1,
    gameType: GameType.Classic,
    gameMode: GameMode.Multiplayer,
    maxRoundTime: DEFAULT_ROUND_TIME,
    dictionary: TEST_DICTIONARY,
    virtualPlayerLevel: VirtualPlayerLevel.Beginner,
};

const DEFAULT_MULTIPLAYER_CONFIG: GameConfig = {
    player1: new Player(DEFAULT_PLAYER_ID1, DEFAULT_PLAYER_NAME1),
    gameType: GameType.Classic,
    gameMode: GameMode.Multiplayer,
    maxRoundTime: DEFAULT_ROUND_TIME,
    dictionary: TEST_DICTIONARY,
};

const DEFAULT_WAITING_ROOM = new WaitingRoom(DEFAULT_MULTIPLAYER_CONFIG, DEFAULT_GAME_CHANNEL_ID);

chai.use(spies);
chai.use(chaiAsPromised);

describe('GameDispatcherService', () => {
    let gameDispatcherService: GameDispatcherService;
    let socketService: SocketService;
    let createGameService: CreateGameService;
    let virtualPlayerService: VirtualPlayerService;
    let activeGameService: ActiveGameService;
    let testingUnit: ServicesTestingUnit;

    beforeEach(() => {
        testingUnit = new ServicesTestingUnit().withStubbedDictionaryService().withStubbed(ChatService);
    });

    beforeEach(() => {
        gameDispatcherService = Container.get(GameDispatcherService);
        socketService = Container.get(SocketService);
        createGameService = Container.get(CreateGameService);
        virtualPlayerService = Container.get(VirtualPlayerService);
        activeGameService = Container.get(ActiveGameService);
    });

    afterEach(() => {
        chai.spy.restore();
        sinon.restore();
        testingUnit.restore();
    });

    it('should create', () => {
        expect(gameDispatcherService).to.exist;
    });

    it('should initiate an empty WaitingRoom in list', () => {
        expect(gameDispatcherService['waitingRooms']).to.be.empty;
    });

    describe('addToRoom', () => {
        it('should add room to waitingRooms', () => {
            gameDispatcherService['addToWaitingRoom'](DEFAULT_WAITING_ROOM);
            expect(gameDispatcherService['waitingRooms'].length).to.equal(1);
        });
    });

    describe('createSoloGame', () => {
        let createSoloGameSpy: unknown;
        let addToRoomSpy: unknown;
        let emitToSocketSpy: unknown;
        let emitToRoomSpy: unknown;
        let virtualPlayerServiceSpy: unknown;
        let activeGameServiceSpy: unknown;

        beforeEach(() => {
            createSoloGameSpy = chai.spy.on(createGameService, 'createSoloGame', () => {
                return DEFAULT_START_GAME_DATA;
            });
            addToRoomSpy = chai.spy.on(socketService, 'addToRoom', () => {
                return;
            });
            emitToSocketSpy = chai.spy.on(socketService, 'emitToSocket', () => {
                return;
            });
            emitToRoomSpy = chai.spy.on(socketService, 'emitToRoom', () => {
                return;
            });
            virtualPlayerServiceSpy = chai.spy.on(virtualPlayerService, 'triggerVirtualPlayerTurn', () => {
                return;
            });
            activeGameServiceSpy = chai.spy.on(activeGameService, 'getGame', () => {
                return;
            });
        });

        it('should call appropriate methods', async () => {
            await gameDispatcherService['createSoloGame'](DEFAULT_SOLO_GAME_CONFIG_DATA);
            expect(createSoloGameSpy).to.have.been.called();
            expect(addToRoomSpy).to.have.been.called();
            expect(emitToSocketSpy).to.have.been.called();
            expect(emitToRoomSpy).to.have.been.called();
            expect(virtualPlayerServiceSpy).to.have.been.called();
            expect(activeGameServiceSpy).to.have.been.called();
        });

        it('should call appropriate methods', async () => {
            DEFAULT_START_GAME_DATA.round.playerData.id = '';
            await gameDispatcherService['createSoloGame'](DEFAULT_SOLO_GAME_CONFIG_DATA);
            expect(createSoloGameSpy).to.have.been.called();
            expect(addToRoomSpy).to.have.been.called();
            expect(emitToSocketSpy).to.have.been.called();
            expect(emitToRoomSpy).to.have.been.called();
            expect(virtualPlayerServiceSpy).not.to.have.been.called();
            expect(activeGameServiceSpy).not.to.have.been.called();
        });
    });

    describe('createMultiplayerGame', () => {
        let createMultiplayerGameSpy: unknown;
        let addToRoomSpy: unknown;

        beforeEach(() => {
            createMultiplayerGameSpy = chai.spy.on(createGameService, 'createMultiplayerGame', () => {
                return DEFAULT_WAITING_ROOM;
            });
            addToRoomSpy = chai.spy.on(socketService, 'addToRoom', () => {
                return;
            });
        });

        it('should call appropriate methods', async () => {
            await gameDispatcherService['createMultiplayerGame'](DEFAULT_SOLO_GAME_CONFIG_DATA, DEFAULT_USER_ID);
            expect(createMultiplayerGameSpy).to.have.been.called();
            expect(addToRoomSpy).to.have.been.called();
        });
    });

    describe('requestJoinGame', () => {
        let id: string;

        beforeEach(() => {
            gameDispatcherService['waitingRooms'] = [DEFAULT_WAITING_ROOM];
            id = DEFAULT_WAITING_ROOM.getId();
            DEFAULT_WAITING_ROOM.joinedPlayer2 = undefined;
            DEFAULT_WAITING_ROOM.joinedPlayer3 = undefined;
            DEFAULT_WAITING_ROOM.joinedPlayer4 = undefined;
            spy.on(gameDispatcherService, 'getMultiplayerGameFromId', () => {
                return DEFAULT_WAITING_ROOM;
            });
        });

        afterEach(() => {
            chai.spy.restore();
        });

        it('should add the player to the waiting game', () => {
            gameDispatcherService.requestJoinGame(id, DEFAULT_OPPONENT_ID, DEFAULT_OPPONENT_NAME);

            expect(DEFAULT_WAITING_ROOM.joinedPlayer2?.id).to.equal(DEFAULT_OPPONENT_ID);
            expect(DEFAULT_WAITING_ROOM.joinedPlayer2?.name).to.equal(DEFAULT_OPPONENT_NAME);
        });

        it('should not join if initiating players have the same name', () => {
            expect(() => {
                gameDispatcherService.requestJoinGame(id, DEFAULT_OPPONENT_ID, DEFAULT_MULTIPLAYER_CONFIG_DATA.playerName);
            }).to.throw(CANNOT_HAVE_SAME_NAME);
        });
    });

    describe('acceptJoinRequest', () => {
        let id: string;
        let gameStub: SinonStubbedInstance<Game>;
        let tileReserveStub: SinonStubbedInstance<TileReserve>;

        beforeEach(() => {
            gameDispatcherService['waitingRooms'] = [DEFAULT_WAITING_ROOM];
            id = DEFAULT_WAITING_ROOM.getId();
            DEFAULT_WAITING_ROOM.joinedPlayer2 = undefined;
            spy.on(gameDispatcherService, 'getMultiplayerGameFromId', () => {
                return DEFAULT_WAITING_ROOM;
            });
            tileReserveStub = createStubInstance(TileReserve);
            tileReserveStub.init.returns(Promise.resolve());
            gameStub = createStubInstance(Game);
            gameStub['tileReserve'] = tileReserveStub as unknown as TileReserve;
            gameDispatcherService.requestJoinGame(id, DEFAULT_OPPONENT_ID, DEFAULT_OPPONENT_NAME);
        });

        afterEach(() => {
            chai.spy.restore();
        });

        it('should remove waitingRoom', async () => {
            expect(gameDispatcherService['waitingRooms'].filter((g) => g.getId() === id)).to.not.be.empty;

            await gameDispatcherService.acceptJoinRequest(id, DEFAULT_MULTIPLAYER_CONFIG_DATA.playerId);

            expect(gameDispatcherService['waitingRooms'].filter((g) => g.getId() === id)).to.be.empty;
        });

        it("should make user join group's channel", async () => {
            const stubbedJoinedPlayer = sinon.createStubInstance(Player);
            stubbedJoinedPlayer.name = DEFAULT_OPPONENT_NAME;
            stubbedJoinedPlayer.id = DEFAULT_OPPONENT_ID;
            DEFAULT_WAITING_ROOM.joinedPlayer2 = stubbedJoinedPlayer as unknown as Player;

            const chatServiceStub = testingUnit.getStubbedInstance(ChatService);
            chatServiceStub.joinChannel.callsFake(async () => {});

            await gameDispatcherService.acceptJoinRequest(id, DEFAULT_MULTIPLAYER_CONFIG_DATA.playerId);

            expect(chatServiceStub.joinChannel.calledWith(DEFAULT_GAME_CHANNEL_ID, stubbedJoinedPlayer.id)).to.be.true;
        });

        // it('should throw error when playerId is invalid', () => {
        //     const invalidId = 'invalidId';

        //     expect(() => gameDispatcherService.acceptJoinRequest(id, invalidId, DEFAULT_OPPONENT_NAME)).to.be.throw(INVALID_PLAYER_ID_FOR_GAME);
        // });

        // it(' should throw error when playerId is invalid', () => {
        //     gameDispatcherService.rejectJoinRequest(id, DEFAULT_MULTIPLAYER_CONFIG_DATA.playerId, DEFAULT_OPPONENT_NAME);

        //     expect(() => gameDispatcherService.acceptJoinRequest(id, DEFAULT_MULTIPLAYER_CONFIG_DATA.playerId, DEFAULT_OPPONENT_NAME)).to.be.throw(
        //         NO_OPPONENT_IN_WAITING_GAME,
        //     );
        // });

        // it(' should throw error when playerId is invalid', () => {
        //     expect(() => gameDispatcherService.acceptJoinRequest(id, DEFAULT_MULTIPLAYER_CONFIG_DATA.playerId, DEFAULT_OPPONENT_NAME_2)).to.be.throw(
        //         OPPONENT_NAME_DOES_NOT_MATCH,
        //     );
        // });
    });

    // TODO:Refactor for 4 player
    // describe('rejectJoinRequest', () => {
    //     let id: string;
    //     let waitingRoom: WaitingRoom;

    //     beforeEach(() => {
    //         gameDispatcherService['waitingRooms'] = [DEFAULT_WAITING_ROOM];
    //         id = DEFAULT_WAITING_ROOM.getId();
    //         DEFAULT_WAITING_ROOM.joinedPlayer2 = undefined;
    //         spy.on(gameDispatcherService, 'getMultiplayerGameFromId', () => {
    //             return DEFAULT_WAITING_ROOM;
    //         });
    //         waitingRoom = gameDispatcherService['waitingRooms'].filter((g) => g.getId() === id)[0];
    //     });

    //     it('should remove joinedPlayer from waitingRoom', () => {
    //         waitingRoom.joinedPlayer2 = DEFAULT_OPPONENT;
    //         gameDispatcherService.rejectJoinRequest(id, DEFAULT_MULTIPLAYER_CONFIG_DATA.playerId, DEFAULT_OPPONENT_NAME);
    //         expect(waitingRoom.joinedPlayer2).to.be.undefined;
    //     });

    //     it('should throw if playerId is invalid', () => {
    //         const invalidId = 'invalidId';
    //         expect(() => gameDispatcherService.rejectJoinRequest(id, invalidId, DEFAULT_OPPONENT_NAME)).to.throw(INVALID_PLAYER_ID_FOR_GAME);
    //     });

    //     it('should throw if no player is waiting', () => {
    //         waitingRoom.joinedPlayer2 = undefined;
    //         expect(() => {
    //             return gameDispatcherService.rejectJoinRequest(id, DEFAULT_MULTIPLAYER_CONFIG_DATA.playerId, DEFAULT_OPPONENT_NAME);
    //         }).to.throw(NO_OPPONENT_IN_WAITING_GAME);
    //     });

    //     it('should throw error if opponent name is incorrect', () => {
    //         waitingRoom.joinedPlayer2 = DEFAULT_OPPONENT;
    //         expect(() => {
    //             return gameDispatcherService.rejectJoinRequest(id, DEFAULT_MULTIPLAYER_CONFIG_DATA.playerId, DEFAULT_OPPONENT_NAME_2);
    //         }).to.throw(OPPONENT_NAME_DOES_NOT_MATCH);
    //     });
    // });

    describe('leaveGroupRequest', () => {
        let id: string;
        // let waitingRoom: WaitingRoom;
        let chatServiceStub: SinonStubbedInstance<ChatService>;

        beforeEach(() => {
            gameDispatcherService['waitingRooms'] = [DEFAULT_WAITING_ROOM];
            id = DEFAULT_WAITING_ROOM.getId();
            spy.on(gameDispatcherService, 'getMultiplayerGameFromId', () => {
                return DEFAULT_WAITING_ROOM;
            });
            // waitingRoom = gameDispatcherService['waitingRooms'].filter((g) => g.getId() === id)[0];
            DEFAULT_WAITING_ROOM.joinedPlayer2 = DEFAULT_OPPONENT;

            chatServiceStub = testingUnit.getStubbedInstance(ChatService);
            chatServiceStub.quitChannel.callsFake(async () => {});
        });

        it("should disconnect joinedPlayer from group's channel", async () => {
            sinon.stub(DEFAULT_WAITING_ROOM, 'getGroupChannelId').returns(DEFAULT_GAME_CHANNEL_ID);
            const expectedId = DEFAULT_WAITING_ROOM.joinedPlayer2?.id;

            await gameDispatcherService.leaveGroupRequest(id, DEFAULT_OPPONENT.id);

            expect(chatServiceStub.quitChannel.calledWith(DEFAULT_WAITING_ROOM.getGroupChannelId(), expectedId)).to.be.true;
        });

        // it('should remove joinedPlayer from waitingRoom', () => {
        //     expect(waitingRoom.joinedPlayer2).to.not.be.undefined;
        //     gameDispatcherService.leaveGroupRequest(id, DEFAULT_OPPONENT_ID);
        //     expect(waitingRoom.joinedPlayer2).to.be.undefined;
        // });

        // it('should throw if playerId is invalid', () => {
        //     const invalidId = 'invalidId';
        //     expect(() => gameDispatcherService.leaveGroupRequest(id, invalidId)).to.throw(INVALID_PLAYER_ID_FOR_GAME);
        // });

        // it('should throw if player is undefined', () => {
        //     waitingRoom.joinedPlayer2 = undefined;
        //     const invalidId = 'invalidId';
        //     expect(() => gameDispatcherService.leaveGroupRequest(id, invalidId)).to.throw(NO_OPPONENT_IN_WAITING_GAME);
        // });

        it('should return the [hostPlayerId, leaverName]', async () => {
            expect(await gameDispatcherService.leaveGroupRequest(id, DEFAULT_OPPONENT_ID)).to.deep.equal([
                DEFAULT_MULTIPLAYER_CONFIG_DATA.playerId,
                DEFAULT_OPPONENT_NAME,
            ]);
        });
    });

    describe('cancelGame', () => {
        let id: string;

        beforeEach(() => {
            gameDispatcherService['waitingRooms'] = [DEFAULT_WAITING_ROOM];
            id = DEFAULT_WAITING_ROOM.getId();
            spy.on(gameDispatcherService, 'getMultiplayerGameFromId', () => {
                return DEFAULT_WAITING_ROOM;
            });
        });

        it('should remove waiting game from list', async () => {
            await gameDispatcherService.cancelGame(id, DEFAULT_MULTIPLAYER_CONFIG_DATA.playerId);
            expect(gameDispatcherService['waitingRooms'].filter((g) => g.getId() === id)).to.be.empty;
        });

        it("should empty the group's channel", async () => {
            const chatServiceStub = testingUnit.getStubbedInstance(ChatService);
            chatServiceStub.emptyChannel.callsFake(async () => {});

            sinon.stub(DEFAULT_WAITING_ROOM, 'getGroupChannelId').returns(DEFAULT_GAME_CHANNEL_ID);

            await gameDispatcherService.cancelGame(id, DEFAULT_MULTIPLAYER_CONFIG_DATA.playerId);

            expect(chatServiceStub.emptyChannel.calledWith(DEFAULT_WAITING_ROOM.getGroupChannelId())).to.be.true;
        });

        it('should throw if playerId is invalid', async () => {
            const invalidId = 'invalidId';
            expect(gameDispatcherService.cancelGame(id, invalidId)).to.eventually.throw(INVALID_PLAYER_ID_FOR_GAME);
        });
    });

    describe('getAvailableWaitingRooms', () => {
        it('should return right amount', () => {
            const NTH_GAMES = 5;
            for (let i = 0; i < NTH_GAMES; ++i) {
                const newRoom = new WaitingRoom(DEFAULT_MULTIPLAYER_CONFIG, DEFAULT_GAME_CHANNEL_ID);
                gameDispatcherService['addToWaitingRoom'](newRoom);
            }

            expect(gameDispatcherService.getAvailableWaitingRooms()).to.have.lengthOf(NTH_GAMES);
        });

        it('should not return games with joined player', () => {
            const NTH_GAMES = 5;
            const NTH_JOINED = 2;
            const testIds: string[] = [];
            gameDispatcherService['waitingRooms'] = [];
            spy.on(gameDispatcherService, 'getMultiplayerGameFromId', (i) => {
                return gameDispatcherService['waitingRooms'][i];
            });

            for (let i = 0; i < NTH_GAMES; ++i) {
                const newRoom = new WaitingRoom(DEFAULT_MULTIPLAYER_CONFIG, DEFAULT_GAME_CHANNEL_ID);
                newRoom['id'] = i as unknown as string;
                gameDispatcherService['addToWaitingRoom'](newRoom);
                testIds.push(newRoom['id']);
            }

            for (let i = 0; i < NTH_GAMES; ++i) {
                if (i < NTH_JOINED) {
                    gameDispatcherService.requestJoinGame(testIds[i], DEFAULT_OPPONENT_ID, DEFAULT_OPPONENT_NAME);
                    gameDispatcherService.requestJoinGame(testIds[i], DEFAULT_OPPONENT_ID, DEFAULT_OPPONENT_NAME);
                    gameDispatcherService.requestJoinGame(testIds[i], DEFAULT_OPPONENT_ID, DEFAULT_OPPONENT_NAME);
                }
            }

            expect(gameDispatcherService.getAvailableWaitingRooms()).to.have.lengthOf(NTH_GAMES - NTH_JOINED);
        });
    });

    describe('getGameFromId', () => {
        let id: string;

        beforeEach(() => {
            gameDispatcherService['waitingRooms'] = [DEFAULT_WAITING_ROOM];
            id = DEFAULT_WAITING_ROOM.getId();
        });

        it('should find the waitingRoom', () => {
            expect(gameDispatcherService['getMultiplayerGameFromId'](id)).to.exist;
        });

        it('should throw when id is invalid', () => {
            const invalidId = 'invalidId';
            expect(() => gameDispatcherService['getMultiplayerGameFromId'](invalidId)).to.throw(NO_GAME_FOUND_WITH_ID);
        });
    });

    describe('isGameInWaitingRooms', () => {
        const stubPlayer: SinonStubbedInstance<Player> = createStubInstance(Player);
        const config: GameConfig = {
            player1: stubPlayer as unknown as Player,
            gameType: GameType.Classic,
            gameMode: GameMode.Multiplayer,
            maxRoundTime: 60,
            dictionary: TEST_DICTIONARY,
        };
        let waitingRooms: WaitingRoom[];

        beforeEach(() => {
            waitingRooms = [new WaitingRoom(config, DEFAULT_GAME_CHANNEL_ID)];
            gameDispatcherService['waitingRooms'] = waitingRooms;
        });

        it('should return false if gameId is not associated to game in waitingRooms', () => {
            const gameId = 'NOT_EXISTING_ID';
            expect(gameDispatcherService.isGameInWaitingRooms(gameId)).to.be.false;
        });

        it('should return true if gameId is associated to game in waitingRooms', () => {
            const gameId = waitingRooms[0].getId();
            expect(gameDispatcherService.isGameInWaitingRooms(gameId)).to.be.true;
        });
    });
});
