/* eslint-disable dot-notation */
import { TestBed } from '@angular/core/testing';
import { ClientChannel } from '@app/classes/chat/channel';
import { SocketTestHelper } from '@app/classes/socket-test-helper/socket-test-helper.spec';
import SocketService from '@app/services/socket-service/socket.service';
import { Channel } from '@common/models/chat/channel';
import { ChatMessage } from '@common/models/chat/chat-message';
import { Socket } from 'socket.io-client';
import { UserService } from '@app/services/user-service/user.service';

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
            const channel = {} as Channel;
            service.createChannel(channel);
            expect(socket.emit).toHaveBeenCalled();
        });
    });

    describe('joinChannel', () => {
        it('should emit to channel:join', () => {
            spyOn(socket, 'emit');
            const channel = 'my channel';
            service.joinChannel(channel);
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
                id: '1',
                name: 'channel',
                messages: [],
            };
            service.channels = [channel];
            service.handleChannelQuit(channel);
            expect(service.channels.length).toEqual(0);
        });
    });

    describe('handleNewMessage', () => {
        it('should add message', () => {
            const channel: ClientChannel = {
                id: '1',
                name: 'channel',
                messages: [],
            };
            service.channels = [channel];
            service.handleNewMessage(channel.id, {} as ChatMessage);
            expect(service.channels[0].messages.length).toEqual(1);
        });
    });
});
