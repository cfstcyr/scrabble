/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Application } from '@app/app';
import { ServerSocket } from '@app/classes/communication/socket-type';
import { ALREADY_EXISTING_CHANNEL_NAME, ALREADY_IN_CHANNEL, CHANNEL_NAME_DOES_NOT_EXIST, NOT_IN_CHANNEL } from '@app/constants/services-errors';
import DictionaryService from '@app/services/dictionary-service/dictionary.service';
import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
import { Delay } from '@app/utils/delay/delay';
import { ChatClientEvents, ChatServerEvents } from '@common/events/chat.event';
import { Channel } from '@common/models/chat/channel';
import { ChatMessage } from '@common/models/chat/chat-message';
import { PublicUser } from '@common/models/user';
import * as chai from 'chai';
import { expect } from 'chai';
import { createServer, Server } from 'http';
import { StatusCodes } from 'http-status-codes';
import { AddressInfo } from 'net';
import * as io from 'socket.io';
import { io as ioClient, Socket as ClientSocket } from 'socket.io-client';
import Container from 'typedi';
import { ChatService } from './chat.service';

// const TIMEOUT_DELAY = 10000;
const RESPONSE_DELAY = 400;
const SERVER_URL = 'http://localhost:';

const PUBLIC_USER: PublicUser = {
    username: 'Bob',
    avatar: 'Gratton',
};

class TestClass {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    testFunc = () => {};
}

describe('ChatService', () => {
    afterEach(() => {
        chai.spy.restore();
    });

    let service: ChatService;
    let sio: io.Server;
    let server: Server;
    let serverSocket: ServerSocket;
    let clientSocket: ClientSocket<ChatServerEvents, ChatClientEvents>;
    let testingUnit: ServicesTestingUnit;

    beforeEach(() => {
        testingUnit = new ServicesTestingUnit().withStubbed(DictionaryService).withStubbedPrototypes(Application, { bindRoutes: undefined });
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

    describe('configureSocket', () => {
        const testChannel: Channel = {
            id: '0',
            name: 'test',
        };
        const expectedMessage: ChatMessage = {
            sender: PUBLIC_USER,
            content: 'Gratton',
        };

        beforeEach(() => {
            service.configureSocket(serverSocket);
            service['channels'].push(testChannel);
        });

        describe('channel:newMessage', () => {
            describe('HAPPY - PATH', () => {
                it('should emit message back to all client in channel', (done) => {
                    clientSocket.on('channel:newMessage', (chatMessage: ChatMessage) => {
                        expect(chatMessage).to.deep.equal(expectedMessage);
                        done();
                    });
                    serverSocket.join(testChannel.name);

                    clientSocket.emit('channel:newMessage', testChannel, expectedMessage);
                });

                it('should not emit message to client NOT in channel', async () => {
                    const testClass = new TestClass();
                    const funcSpy = chai.spy.on(testClass, 'testFunc');

                    clientSocket.on('channel:newMessage', () => {
                        testClass.testFunc();
                    });
                    clientSocket.on('end' as any, async () => Promise.resolve());

                    clientSocket.emit('channel:newMessage', testChannel, expectedMessage);
                    await Delay.for(RESPONSE_DELAY);

                    expect(funcSpy).not.to.have.been.called();
                    serverSocket.emit('end' as any);
                });
            });
            describe('SAD PATH', () => {
                it('should throw error if channel does NOT exist', (done) => {
                    service['channels'] = [];
                    clientSocket.on('error' as any, (err: string, code: number) => {
                        expect(err).to.equal(CHANNEL_NAME_DOES_NOT_EXIST);
                        expect(code).to.equal(StatusCodes.BAD_REQUEST);
                        done();
                    });
                    serverSocket.join(testChannel.name);

                    clientSocket.emit('channel:newMessage', testChannel, expectedMessage);
                });

                it.only('should throw error if user not in channel', (done) => {
                    clientSocket.on('error' as any, (err: string, code: number) => {
                        expect(err).to.equal(NOT_IN_CHANNEL);
                        expect(code).to.equal(StatusCodes.FORBIDDEN);
                        done();
                    });
                    serverSocket.leave(testChannel.name);

                    clientSocket.emit('channel:newMessage', testChannel, expectedMessage);
                });
            });
        });

        describe('channel:createChannel', () => {
            describe('HAPPY PATH', () => {
                it("should add channel to list of channels if it doesn't exist", async () => {
                    service['channels'] = [];
                    clientSocket.emit('channel:newChannel', testChannel);

                    await Delay.for(RESPONSE_DELAY);

                    expect(service['channels'].map((c) => c.name)).to.contain(testChannel.name);
                });
            });
            describe('SAD PATH', () => {
                it('should throw error if channel already exist', (done) => {
                    service['channels'] = [testChannel];
                    clientSocket.on('error' as any, (err: string, code: number) => {
                        expect(err).to.equal(ALREADY_EXISTING_CHANNEL_NAME);
                        expect(code).to.equal(StatusCodes.FORBIDDEN);
                        done();
                    });

                    clientSocket.emit('channel:newChannel', testChannel);
                });
            });
        });

        describe('channel:join', () => {
            describe('HAPPY PATH', () => {
                it('should add socket to channel room', async () => {
                    clientSocket.emit('channel:join', testChannel);

                    await Delay.for(RESPONSE_DELAY);

                    expect(serverSocket.rooms.has(testChannel.name)).to.be.true;
                });
            });
            describe('SAD PATH', () => {
                it('should throw error if channel does NOT exist', (done) => {
                    service['channels'] = [];
                    clientSocket.on('error' as any, (err: string, code: number) => {
                        expect(err).to.equal(CHANNEL_NAME_DOES_NOT_EXIST);
                        expect(code).to.equal(StatusCodes.BAD_REQUEST);
                        done();
                    });

                    clientSocket.emit('channel:join', testChannel);
                });
                it('should throw error if user already in channel', (done) => {
                    clientSocket.on('error' as any, (err: string, code: number) => {
                        expect(err).to.equal(ALREADY_IN_CHANNEL);
                        expect(code).to.equal(StatusCodes.BAD_REQUEST);
                        done();
                    });
                    serverSocket.join(testChannel.name);

                    clientSocket.emit('channel:join', testChannel);
                });
            });
        });

        describe('channel:quit', () => {
            describe('HAPPY PATH', () => {
                it('should remove socket from channel room of room exists', async () => {
                    serverSocket.join(testChannel.name);

                    clientSocket.emit('channel:quit', testChannel);

                    await Delay.for(RESPONSE_DELAY);

                    expect(serverSocket.rooms.has(testChannel.name)).to.be.false;
                });
            });
            describe('SAD PATH', () => {
                it('should throw error if channel does NOT exist', (done) => {
                    service['channels'] = [];
                    clientSocket.on('error' as any, (err: string, code: number) => {
                        expect(err).to.equal(CHANNEL_NAME_DOES_NOT_EXIST);
                        expect(code).to.equal(StatusCodes.BAD_REQUEST);
                        done();
                    });
                    serverSocket.join(testChannel.name);

                    clientSocket.emit('channel:quit', testChannel);
                });
                it('should throw error if user NOT in channel', (done) => {
                    clientSocket.on('error' as any, (err: string, code: number) => {
                        expect(err).to.equal(NOT_IN_CHANNEL);
                        expect(code).to.equal(StatusCodes.BAD_REQUEST);
                        done();
                    });
                    serverSocket.leave(testChannel.name);

                    clientSocket.emit('channel:quit', testChannel);
                });
            });
        });
    });
});
