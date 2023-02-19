/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Application } from '@app/app';
import { ServerSocket } from '@app/classes/communication/socket-type';
import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
import { ChatClientEvents, ChatServerEvents } from '@common/events/chat.event';
import { createServer, Server } from 'http';
import { AddressInfo } from 'net';
import * as io from 'socket.io';
import { io as ioClient, Socket as ClientSocket } from 'socket.io-client';
import { Container } from 'typedi';
import { ChatService } from './chat.service';
import * as Sinon from 'sinon';
import { expect } from 'chai';
import { Channel, ChannelCreation } from '@common/models/chat/channel';
import { ChatMessage } from '@common/models/chat/chat-message';
import { PublicUser, UserDatabase } from '@common/models/user';
import { ALREADY_EXISTING_CHANNEL_NAME, ALREADY_IN_CHANNEL, CHANNEL_DOES_NOT_EXISTS, NOT_IN_CHANNEL } from '@app/constants/services-errors';
import { Delay } from '@app/utils/delay/delay';
import { StatusCodes } from 'http-status-codes';
import { getSocketNameFromChannel } from '@app/utils/socket';
import { SocketErrorResponse } from '@common/models/error';
import { SocketService } from '@app/services/socket-service/socket.service';
import { TypeOfId } from '@common/types/id';
import { PlayerData } from '@app/classes/communication/player-data';
import { SOCKET_CONFIGURE_EVENT_NAME } from '@app/constants/services-constants/socket-consts';
import { ChatPersistenceService } from '@app/services/chat-persistence-service/chat-persistence.service';
import { AuthentificationService } from '@app/services/authentification-service/authentification.service';
import { ConnectedUser } from '@app/classes/user/connected-user';
import { EventEmitter } from 'stream';
import { ChatHistoryService } from '../chat-history/chat-history.service';

// const TIMEOUT_DELAY = 10000;
const RESPONSE_DELAY = 400;
const SERVER_URL = 'http://localhost:';

const USER: UserDatabase = {
    email: 'bob@example.com',
    idUser: 1,
    username: 'Bob',
    password: '',
    avatar: '',
};

const PUBLIC_USER: PublicUser = {
    email: USER.email,
    username: USER.username,
    avatar: '',
};

const testChannel: Channel = {
    idChannel: 0,
    name: 'test',
    canQuit: true,
    private: false,
    default: false,
};
const expectedMessage: ChatMessage = {
    sender: PUBLIC_USER,
    content: 'message cool',
    date: new Date(),
};

const DEFAULT_PLAYER_ID: TypeOfId<PlayerData> = '1';

const channelCreation: ChannelCreation = {
    name: 'test',
};

class TestClass {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    testFunc = () => { };
}

describe('ChatService', () => {
    afterEach(() => {
        Sinon.restore();
    });

    let service: ChatService;
    let sio: io.Server;
    let server: Server;
    let serverSocket: ServerSocket;
    let clientSocket: ClientSocket<ChatServerEvents, ChatClientEvents>;
    let testingUnit: ServicesTestingUnit;
    let chatPersistenceService: Sinon.SinonStubbedInstance<ChatPersistenceService>;
    let chatHistoryService: Sinon.SinonStubbedInstance<ChatHistoryService>;

    beforeEach(async () => {
        testingUnit = new ServicesTestingUnit()
            .withStubbed(ChatPersistenceService)
            .withStubbed(ChatHistoryService)
            .withStubbed(AuthentificationService, undefined, {
                connectedUsers: new ConnectedUser(), getUserById: () =>
                    Promise.resolve(USER),
            })
            .withStubbed(SocketService)
            .withStubbedPrototypes(Application, { bindRoutes: undefined });
        chatHistoryService = testingUnit.setStubbed(ChatHistoryService);
        chatPersistenceService = testingUnit.setStubbed(ChatPersistenceService);
        await testingUnit.withMockDatabaseService();
    });

    beforeEach((done) => {
        service = Container.get(ChatService);
        server = createServer();
        sio = new io.Server(server);
        server.listen(() => {
            const port: number = (server.address() as AddressInfo).port;
            clientSocket = ioClient(SERVER_URL + port);
            sio.on('connection', (socket: io.Socket) => (serverSocket = socket));
            clientSocket.on('connect', done);
        });
    });

    afterEach(() => {
        sio.close();
        serverSocket.disconnect();
        clientSocket.close();
        testingUnit.restore();
    });

    describe('constructor', () => {
        it(`should configureSocket when configureSocketsEvent emits ${SOCKET_CONFIGURE_EVENT_NAME}`, async () => {
            const socketService = testingUnit.getStubbedInstance(SocketService);
            socketService['configureSocketsEvent'] = new EventEmitter();
            socketService.listenToInitialisationEvent.restore();

            service = new ChatService(
                socketService as unknown as SocketService,
                chatPersistenceService as unknown as ChatPersistenceService,
                testingUnit.getStubbedInstance(AuthentificationService) as unknown as AuthentificationService,
                chatHistoryService as unknown as ChatHistoryService,
            );

            const stub = Sinon.stub(service, 'initChannelsForSocket' as any).callsFake(() => { });

            socketService['configureSocketsEvent'].emit(SOCKET_CONFIGURE_EVENT_NAME, serverSocket);

            clientSocket.emit('channel:init');
            await Delay.for(RESPONSE_DELAY);

            expect(stub.calledWith(serverSocket)).to.be.true;
        });
    });

    describe('initialize', () => {
        it('should call createDefaultChannels', async () => {
            await service.initialize();

            expect(chatPersistenceService.createDefaultChannels.called).to.be.true;
        });
    });

    describe('configureSocket', () => {
        beforeEach(async () => {
            service.configureSocket(serverSocket);
        });

        describe('channel:newMessage', () => {
            describe('HAPPY - PATH', () => {
                it('should not emit message to client NOT in channel', async () => {
                    chatPersistenceService.getChannel.resolves(testChannel);

                    const testClass = new TestClass();
                    const funcSpy = Sinon.spy(testClass, 'testFunc');

                    clientSocket.on('channel:newMessage', () => {
                        testClass.testFunc();
                    });
                    clientSocket.on('end' as any, async () => Promise.resolve());

                    clientSocket.emit('channel:newMessage', { idChannel: testChannel.idChannel, message: expectedMessage });
                    await Delay.for(RESPONSE_DELAY);

                    expect(funcSpy.called).to.be.false;
                    serverSocket.emit('end' as any);
                });
            });
            describe('SAD PATH', () => {
                it('should throw error if channel does NOT exist', async () => {
                    return new Promise((resolve) => {
                        clientSocket.on('error' as any, (error: SocketErrorResponse) => {
                            expect(error.message).to.equal(CHANNEL_DOES_NOT_EXISTS);
                            expect(error.status).to.equal(StatusCodes.BAD_REQUEST);
                            resolve();
                        });
                        serverSocket.join(getSocketNameFromChannel(testChannel));

                        clientSocket.emit('channel:newMessage', { idChannel: testChannel.idChannel, message: expectedMessage });
                    });
                });

                it('should throw error if user not in channel', (done) => {
                    chatPersistenceService.getChannel.resolves(testChannel);

                    clientSocket.on('error' as any, (error: SocketErrorResponse) => {
                        expect(error.message).to.equal(NOT_IN_CHANNEL);
                        expect(error.status).to.equal(StatusCodes.FORBIDDEN);
                        done();
                    });
                    serverSocket.leave(getSocketNameFromChannel(testChannel));

                    clientSocket.emit('channel:newMessage', { idChannel: testChannel.idChannel, message: expectedMessage });
                });
            });
        });

        describe('channel:createChannel', () => {
            describe('HAPPY PATH', () => {
                it("should saveChannel of channels if it doesn't exist", async () => {
                    chatPersistenceService.isChannelNameAvailable.resolves(true);

                    clientSocket.emit('channel:newChannel', testChannel);

                    await Delay.for(RESPONSE_DELAY);

                    expect(chatPersistenceService.saveChannel.called).to.be.true;
                });
            });
            describe('SAD PATH', () => {
                it('should throw error if channel already exist', (done) => {
                    chatPersistenceService.isChannelNameAvailable.resolves(false);

                    clientSocket.on('error' as any, (error: SocketErrorResponse) => {
                        expect(error.message).to.equal(ALREADY_EXISTING_CHANNEL_NAME);
                        expect(error.status).to.equal(StatusCodes.FORBIDDEN);
                        done();
                    });

                    clientSocket.emit('channel:newChannel', testChannel);
                });
            });
        });

        describe('channel:join', () => {
            describe('HAPPY PATH', () => {
                it('should add socket to channel room', async () => {
                    chatPersistenceService.getChannel.resolves(testChannel);
                    chatPersistenceService.joinChannel.resolves();
                    serverSocket.data.user = USER;

                    clientSocket.emit('channel:join', testChannel.idChannel);

                    await Delay.for(RESPONSE_DELAY);

                    expect(serverSocket.rooms.has(getSocketNameFromChannel(testChannel))).to.be.true;
                });
            });
            describe('SAD PATH', () => {
                it('should throw error if channel does NOT exist', async () => {
                    return new Promise((resolve) => {
                        clientSocket.on('error' as any, (error: SocketErrorResponse) => {
                            expect(error.message).to.equal(CHANNEL_DOES_NOT_EXISTS);
                            expect(error.status).to.equal(StatusCodes.BAD_REQUEST);
                            resolve();
                        });

                        clientSocket.emit('channel:join', testChannel.idChannel);
                    });
                });
                it('should throw error if user already in channel', (done) => {
                    chatPersistenceService.getChannel.resolves(testChannel);

                    clientSocket.on('error' as any, (error: SocketErrorResponse) => {
                        expect(error.message).to.equal(ALREADY_IN_CHANNEL);
                        expect(error.status).to.equal(StatusCodes.BAD_REQUEST);
                        done();
                    });
                    serverSocket.join(getSocketNameFromChannel(testChannel));

                    clientSocket.emit('channel:join', testChannel.idChannel);
                });
            });
        });

        describe('channel:quit', () => {
            describe('HAPPY PATH', () => {
                it('should remove socket from channel room of room exists', async () => {
                    chatPersistenceService.getChannel.resolves(testChannel);

                    serverSocket.join(getSocketNameFromChannel(testChannel));

                    clientSocket.emit('channel:quit', testChannel.idChannel);

                    await Delay.for(RESPONSE_DELAY);

                    expect(serverSocket.rooms.has(getSocketNameFromChannel(testChannel))).to.be.false;
                });
            });
            describe('SAD PATH', () => {
                it('should throw error if channel does NOT exist', async () => {
                    return new Promise((resolve) => {
                        clientSocket.on('error' as any, (error: SocketErrorResponse) => {
                            expect(error.message).to.equal(CHANNEL_DOES_NOT_EXISTS);
                            expect(error.status).to.equal(StatusCodes.BAD_REQUEST);
                            resolve();
                        });
                        serverSocket.join(getSocketNameFromChannel(testChannel));

                        clientSocket.emit('channel:quit', testChannel.idChannel);
                    });
                });
            });
        });
    });

    describe('createChannel', () => {
        it('should call handleCreateChannel', async () => {
            const stub = Sinon.stub(service, 'handleCreateChannel' as any).callsFake(async () => Promise.resolve());
            // testingUnit.getStubbedInstance(AuthentificationService).connectedUsers = new ConnectedUser();
            Sinon.stub(testingUnit.getStubbedInstance(AuthentificationService).connectedUsers, 'getSocketId')
                .withArgs(USER.idUser)
                .returns(DEFAULT_PLAYER_ID);
            testingUnit.getStubbedInstance(SocketService).getSocket.withArgs(DEFAULT_PLAYER_ID).returns(serverSocket);

            await service['createChannel'](channelCreation, USER.idUser);

            expect(stub.calledWith(channelCreation, serverSocket)).to.be.true;
        });
    });

    describe('joinChannel', () => {
        it('should call handleJoinChannel', async () => {
            const stub = Sinon.stub(service, 'handleJoinChannel' as any).callsFake(async () => Promise.resolve());
            testingUnit.getStubbedInstance(SocketService).getSocket.withArgs(DEFAULT_PLAYER_ID).returns(serverSocket);

            await service['joinChannel'](testChannel.idChannel, DEFAULT_PLAYER_ID);

            expect(stub.calledWith(testChannel.idChannel, serverSocket)).to.be.true;
        });
    });

    describe('quitChannel', () => {
        it('should call handleQuitChannel', async () => {
            const stub = Sinon.stub(service, 'handleQuitChannel' as any).callsFake(async () => Promise.resolve());
            testingUnit.getStubbedInstance(SocketService).getSocket.withArgs(DEFAULT_PLAYER_ID).returns(serverSocket);

            await service['quitChannel'](testChannel.idChannel, DEFAULT_PLAYER_ID);

            expect(stub.calledWith(testChannel.idChannel, serverSocket)).to.be.true;
        });
    });

    describe('emptyChannel', () => {
        it('should make every userId in channel quit', async () => {
            const expectedUserIds = [1, 2, 3];
            chatPersistenceService.getChannelUserIds.resolves(expectedUserIds);
            Sinon.stub(testingUnit.getStubbedInstance(AuthentificationService).connectedUsers, 'getSocketId').returns(DEFAULT_PLAYER_ID);

            const handleQuitStub = Sinon.stub(service, 'handleQuitChannel' as any).callsFake(async () => Promise.resolve());
            testingUnit
                .getStubbedInstance(SocketService)
                .getSocket.onFirstCall()
                .returns(expectedUserIds[0] as unknown as ServerSocket)
                .onSecondCall()
                .returns(expectedUserIds[1] as unknown as ServerSocket)
                .onThirdCall()
                .returns(expectedUserIds[2] as unknown as ServerSocket);

            await service['emptyChannel'](testChannel.idChannel);

            expectedUserIds.forEach((userId) => {
                expect(handleQuitStub.calledWith(testChannel.idChannel, userId)).to.be.true;
            });
        });

        it('should call deleteChannelHistory', async () => {
            const expectedUserIds = [1, 2, 3];
            chatPersistenceService.getChannelUserIds.resolves(expectedUserIds);
            Sinon.stub(testingUnit.getStubbedInstance(AuthentificationService).connectedUsers, 'getSocketId').returns(DEFAULT_PLAYER_ID);

            Sinon.stub(service, 'handleQuitChannel' as any).callsFake(async () => Promise.resolve());
            testingUnit
                .getStubbedInstance(SocketService)
                .getSocket.onFirstCall()
                .returns(expectedUserIds[0] as unknown as ServerSocket)
                .onSecondCall()
                .returns(expectedUserIds[1] as unknown as ServerSocket)
                .onThirdCall()
                .returns(expectedUserIds[2] as unknown as ServerSocket);

            await service['emptyChannel'](testChannel.idChannel);

            expect(chatHistoryService.deleteChannelHistory.calledWith(testChannel.idChannel)).to.be.true;
        });
    });
});
