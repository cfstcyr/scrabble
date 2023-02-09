/* eslint-disable dot-notation */
import { TestBed } from '@angular/core/testing';
import { ClientChannel } from '@app/classes/chat/channel';
import { SocketTestHelper } from '@app/classes/socket-test-helper/socket-test-helper.spec';
import SocketService from '@app/services/socket-service/socket.service';
import { UserService } from '@app/services/user-service/user.service';
import { Channel } from '@common/models/chat/channel';
import { ChannelMessage, ChatMessage } from '@common/models/chat/chat-message';
import { Socket } from 'socket.io-client';

import { ChatService } from './chat.service';

describe('ChatService', () => {
    let service: ChatService;
    let socket: Socket;
    let socketService: jasmine.SpyObj<SocketService>;
    let userService: jasmine.SpyObj<UserService>;

    beforeEach(() => {
        socket = new SocketTestHelper() as unknown as Socket;
        socketService = jasmine.createSpyObj('SocketService', ['initializeService', 'getId', 'on'], { socket });
        userService = jasmine.createSpyObj('UserService', ['isUser']);

        TestBed.configureTestingModule({
            providers: [
                { provide: SocketService, useValue: socketService },
                { provide: UserService, useValue: userService },
            ],
        });
        service = TestBed.inject(ChatService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
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
            expect(service.channels.length).toEqual(1);
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
            service.channels = [channel];
            service.handleChannelQuit(channel);
            expect(service.channels.length).toEqual(0);
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
            service.channels = [channel];
            service.handleNewMessage({ idChannel: channel.idChannel, message: {} as ChatMessage } as ChannelMessage);
            expect(service.channels[0].messages.length).toEqual(1);
        });
    });
});
