/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable dot-notation */
import { GameConfig } from '@app/classes/game/game-config';
import WaitingRoom from '@app/classes/game/waiting-room';
import Player from '@app/classes/player/player';
import { GROUP_CHANNEL } from '@app/constants/chat';
import { ActiveGameService } from '@app/services/active-game-service/active-game.service';
import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
import * as chai from 'chai';
import { expect, spy } from 'chai';
import * as spies from 'chai-spies';
import * as sinon from 'sinon';
import { SinonStubbedInstance } from 'sinon';
import { Container } from 'typedi';
import * as uuid from 'uuid';
import { ChatService } from '@app/services/chat-service/chat.service';
import { CreateGameService } from './create-game.service';
import { VirtualPlayerLevel } from '@common/models/virtual-player-level';

chai.use(spies);

const DEFAULT_PLAYER_ID = 'playerId';
const DEFAULT_USER_ID = 1;

const DEFAULT_MAX_ROUND_TIME = 1;

const DEFAULT_PLAYER_NAME = 'player';
const DEFAULT_GAME_CONFIG_DATA: GameConfigData = {
    playerName: DEFAULT_PLAYER_NAME,
    playerId: DEFAULT_PLAYER_ID,
    virtualPlayerLevel: VirtualPlayerLevel.Beginner,
    maxRoundTime: DEFAULT_MAX_ROUND_TIME,
};

const DEFAULT_GAME_CONFIG: GameConfig = {
    player1: new Player(DEFAULT_PLAYER_ID, DEFAULT_PLAYER_NAME),
    maxRoundTime: DEFAULT_MAX_ROUND_TIME,
};

describe('CreateGameService', () => {
    let createGameService: CreateGameService;
    let activeGameServiceStub: SinonStubbedInstance<ActiveGameService>;
    let testingUnit: ServicesTestingUnit;

    beforeEach(() => {
        testingUnit = new ServicesTestingUnit().withStubbed(ChatService);
        activeGameServiceStub = testingUnit.setStubbed(ActiveGameService);
        activeGameServiceStub.beginGame.resolves();
        createGameService = Container.get(CreateGameService);
        spy.on(uuid, 'v4', () => {
            return '';
        });
    });

    afterEach(() => {
        chai.spy.restore();
        sinon.restore();
        testingUnit.restore();
    });

    describe('createMultiplayerGame', () => {
        let chatServiceStub: SinonStubbedInstance<ChatService>;

        beforeEach(() => {
            spy.on(createGameService, 'generateGameConfig', () => {
                return DEFAULT_GAME_CONFIG;
            });
            chatServiceStub = testingUnit.getStubbedInstance(ChatService);
            chatServiceStub.createChannel.resolves({ ...GROUP_CHANNEL, idChannel: 1, canQuit: true, default: false, private: true });
        });

        it('should return waiting room with config and channel id', async () => {
            const newWaitingRoom = await createGameService.createMultiplayerGame(DEFAULT_GAME_CONFIG_DATA, DEFAULT_USER_ID);
            expect(newWaitingRoom).to.be.an.instanceof(WaitingRoom);
            expect(newWaitingRoom['config']).to.deep.equal(DEFAULT_GAME_CONFIG);
            expect(newWaitingRoom['groupChannelId']).to.equal(1);
        });
    });

    describe('generateGameConfig', () => {
        it('should call generateGameConfig', () => {
            const configSpy = spy.on(createGameService, 'generateGameConfig');
            createGameService.createMultiplayerGame(DEFAULT_GAME_CONFIG_DATA, DEFAULT_USER_ID);
            expect(configSpy).to.have.been.called();
        });
    });

    describe('generateReadyGameConfig', () => {
        it('should return a ReadyGameConfig', () => {
            const DEFAULT_PLAYER_2 = new Player('testid2', 'DJ TESTO');
            const DEFAULT_PLAYER_3 = new Player('testid3', 'DJ TESTO');
            const DEFAULT_PLAYER_4 = new Player('testid4', 'DJ TESTO');
            const newReadyGameConfig = createGameService['generateReadyGameConfig'](
                DEFAULT_PLAYER_2,
                DEFAULT_PLAYER_3,
                DEFAULT_PLAYER_4,
                DEFAULT_GAME_CONFIG,
            );
            const DEFAULT_READY_GAME_CONFIG = {
                ...DEFAULT_GAME_CONFIG,
                player2: DEFAULT_PLAYER_2,
                player3: DEFAULT_PLAYER_3,
                player4: DEFAULT_PLAYER_4,
            };
            expect(newReadyGameConfig).to.deep.equal(DEFAULT_READY_GAME_CONFIG);
        });
    });
});
