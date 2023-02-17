/* eslint-disable dot-notation */
import { TestBed } from '@angular/core/testing';
import { ClientChannel } from '@app/classes/chat/channel';
import { ClientSocket } from '@app/classes/communication/socket-type';
import { SocketTestHelper } from '@app/classes/socket-test-helper/socket-test-helper.spec';
import SocketService from '@app/services/socket-service/socket.service';
import { UserService } from '@app/services/user-service/user.service';
import { Channel } from '@common/models/chat/channel';
import { PublicUser } from '@common/models/user';
import { Subject } from 'rxjs';
import { ChannelMessage, ChatMessage } from '@common/models/chat/chat-message';
import { Socket } from 'socket.io-client';
import { ChatService } from './chat.service';

const USER: PublicUser = {
    avatar: 'avatar',
    email: 'email',
    username: 'username',
};
const CHANNEL_1: ClientChannel = {
    idChannel: 1,
    name: '1',
    messages: [],
    canQuit: false,
    private: false,
    default: false,
};
const CHANNEL_2: ClientChannel = {
    idChannel: 2,
    name: '2',
    messages: [],
    canQuit: false,
    private: false,
    default: false,
};

describe('ChatService', () => {
    let service: ChatService;
    let socket: Socket;
    let socketService: jasmine.SpyObj<SocketService>;
    let onSocketConnect: Subject<ClientSocket>;
    let onSocketDisconnect: Subject<void>;

    beforeEach(() => {
        onSocketConnect = new Subject();
        onSocketDisconnect = new Subject();
        socket = new SocketTestHelper() as unknown as Socket;
        socketService = jasmine.createSpyObj('SocketService', ['initializeService', 'getId', 'on'], {
            socket,
            onConnect: onSocketConnect,
            onDisconnect: onSocketDisconnect,
        });

        TestBed.configureTestingModule({
            providers: [{ provide: SocketService, useValue: socketService }, UserService],
        });
        service = TestBed.inject(ChatService);

        const userService = TestBed.inject(UserService);
        userService.user.next(USER);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('constructor', () => {
        it('should pass new map on socket connect', (done) => {
            let callCount = 0;
            service.channels.subscribe(() => {
                callCount++;
                if (callCount === 2) {
                    expect(true).toBeTrue();
                    done();
                }
            });

            onSocketConnect.next(socket);
        });

        it('should pass next on socket connect', (done) => {
            service.ready.subscribe((ready) => {
                expect(ready).toBeTrue();
                done();
            });

            onSocketConnect.next(socket);
        });

        it('should pass ready to false on socket disconnect', (done) => {
            service.ready.subscribe((ready) => {
                expect(ready).toBeFalse();
                done();
            });

            onSocketDisconnect.next();
        });

        it('should pass new map on socket connect', (done) => {
            let callCount = 0;
            service.channels.subscribe(() => {
                callCount++;
                if (callCount === 2) {
                    expect(true).toBeTrue();
                    done();
                }
            });

            onSocketDisconnect.next();
        });
    });

    describe('getChannels', () => {
        it('should pass all channels', (done) => {
            const map = new Map([
                [CHANNEL_1.idChannel, CHANNEL_1],
                [CHANNEL_2.idChannel, CHANNEL_2],
            ]);
            service.channels.next(map);

            service.getChannels().subscribe((channels) => {
                expect(channels).toHaveSize(2);
                expect(channels).toContain(CHANNEL_1);
                expect(channels).toContain(CHANNEL_2);
                done();
            });
        });
    });

    describe('configureSocket', () => {
        it('should configure on events', () => {
            spyOn(socket, 'on');
            service.configureSocket(socket);
            expect(socket.on).toHaveBeenCalled();
        });

        it('should emit channel:init', () => {
            spyOn(socket, 'emit');
            service.configureSocket(socket);
            expect(socket.emit).toHaveBeenCalled();
        });
    });

    describe('sendMessage', () => {
        it('should emit to channel:newMessage', () => {
            spyOn(socket, 'emit');
            service.sendMessage({} as Channel, '');
            expect(socket.emit).toHaveBeenCalled();
        });
    });

    describe('createChannel', () => {
        it('should emit to channel:newChannel', () => {
            spyOn(socket, 'emit');
            service.createChannel('');
            expect(socket.emit).toHaveBeenCalled();
        });
    });

    describe('joinChannel', () => {
        it('should emit to channel:join', () => {
            spyOn(socket, 'emit');
            service.joinChannel(1);
            expect(socket.emit).toHaveBeenCalled();
        });
    });

    describe('handleJoinChannel', () => {
        it('should add channel', () => {
            service.handleJoinChannel({} as Channel);
            expect(service.channels.value.size).toEqual(1);
        });

        it('should emit to joinedChannel', () => {
            spyOn(service.joinedChannel, 'next');
            service.handleJoinChannel({} as Channel);
            expect(service.joinedChannel.next).toHaveBeenCalled();
        });
    });

    describe('handleChannelQuit', () => {
        it('should remove channel', () => {
            const channel: ClientChannel = {
                idChannel: 1,
                name: 'channel',
                messages: [],
                canQuit: true,
                private: false,
                default: false,
            };
            service.channels.next(new Map([[channel.idChannel, channel]]));
            service.handleChannelQuit(channel);
            expect(service.channels.value.size).toEqual(0);
        });
    });

    describe('handleNewMessage', () => {
        it('should add message', () => {
            const channel: ClientChannel = {
                idChannel: 1,
                name: 'channel',
                messages: [],
                canQuit: true,
                private: false,
                default: false,
            };

            service.channels.next(new Map([[channel.idChannel, channel]]));
            service.handleNewMessage({ idChannel: channel.idChannel, message: {} as ChatMessage } as ChannelMessage);
            expect(service.channels.value.get(channel.idChannel)?.messages.length).toEqual(1);
        });
    });
});
