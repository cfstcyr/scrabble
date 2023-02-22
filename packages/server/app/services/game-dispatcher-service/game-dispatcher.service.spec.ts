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
import { ACCEPT } from '@app/constants/services-constants/game-dispatcher-const';
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
import { GameDispatcherService } from './game-dispatcher.service';

const expect = chai.expect;

const DEFAULT_PLAYER_NAME1 = 'newKidOnTheBlock1';
const DEFAULT_PLAYER_ID1 = 'id1';
const DEFAULT_PLAYER_NAME2 = 'newKidOnTheBlock2';
const DEFAULT_PLAYER_ID2 = 'id';
const DEFAULT_PLAYER_NAME3 = 'newKidOnTheBlock3';
const DEFAULT_PLAYER_ID3 = 'id3';
const DEFAULT_GAME_ID = 'gameId';
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

const DEFAULT_WAITING_ROOM = new WaitingRoom(DEFAULT_MULTIPLAYER_CONFIG);

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
        testingUnit = new ServicesTestingUnit().withStubbedDictionaryService();
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
            await gameDispatcherService['createMultiplayerGame'](DEFAULT_SOLO_GAME_CONFIG_DATA);
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

    describe('leaveLobbyRequest', () => {
        let id: string;
        let waitingRoom: WaitingRoom;

        beforeEach(() => {
            gameDispatcherService['waitingRooms'] = [DEFAULT_WAITING_ROOM];
            id = DEFAULT_WAITING_ROOM.getId();
            spy.on(gameDispatcherService, 'getMultiplayerGameFromId', () => {
                return DEFAULT_WAITING_ROOM;
            });
            waitingRoom = gameDispatcherService['waitingRooms'].filter((g) => g.getId() === id)[0];
            DEFAULT_WAITING_ROOM.joinedPlayer2 = DEFAULT_OPPONENT;
        });

        it('should remove joinedPlayer from waitingRoom', () => {
            expect(waitingRoom.joinedPlayer2).to.not.be.undefined;
            gameDispatcherService.leaveLobbyRequest(id, DEFAULT_OPPONENT_ID);
            expect(waitingRoom.joinedPlayer2).to.be.undefined;
        });

        it('should return the [hostPlayerId, leaverName]', () => {
            expect(gameDispatcherService.leaveLobbyRequest(id, DEFAULT_OPPONENT_ID)).to.deep.equal([
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

        it('should remove waiting game from list', () => {
            gameDispatcherService.cancelGame(id, DEFAULT_MULTIPLAYER_CONFIG_DATA.playerId);
            expect(gameDispatcherService['waitingRooms'].filter((g) => g.getId() === id)).to.be.empty;
        });

        it('should throw if playerId is invalid', () => {
            const invalidId = 'invalidId';
            expect(() => gameDispatcherService.cancelGame(id, invalidId)).to.throw(INVALID_PLAYER_ID_FOR_GAME);
        });
    });

    describe('getAvailableWaitingRooms', () => {
        it('should return right amount', () => {
            const NTH_GAMES = 5;
            for (let i = 0; i < NTH_GAMES; ++i) {
                const newRoom = new WaitingRoom(DEFAULT_MULTIPLAYER_CONFIG);
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
                const newRoom = new WaitingRoom(DEFAULT_MULTIPLAYER_CONFIG);
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
            waitingRooms = [new WaitingRoom(config)];
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
