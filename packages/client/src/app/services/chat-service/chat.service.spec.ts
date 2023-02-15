/* eslint-disable dot-notation */
import { TestBed } from '@angular/core/testing';
import { ClientSocket } from '@app/classes/communication/socket-type';
// import { ClientChannel } from '@app/classes/chat/channel';
import { SocketTestHelper } from '@app/classes/socket-test-helper/socket-test-helper.spec';
import SocketService from '@app/services/socket-service/socket.service';
import { UserService } from '@app/services/user-service/user.service';
import { Channel } from '@common/models/chat/channel';
import { PublicUser } from '@common/models/user';
import { Observable } from 'rxjs';
// import { ChannelMessage, ChatMessage } from '@common/models/chat/chat-message';
import { Socket } from 'socket.io-client';
import { ChatService } from './chat.service';

const USER: PublicUser = {
    avatar: 'avatar',
    email: 'email',
    username: 'username',
};

describe('ChatService', () => {
    let service: ChatService;
    let socket: Socket;
    let socketService: jasmine.SpyObj<SocketService>;
    let onSocketConnect: Observable<ClientSocket>;
    let onSocketDisconnect: Observable<void>;

    beforeEach(() => {
        onSocketConnect = new Observable();
        onSocketDisconnect = new Observable();
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
            const channel = 'my channel';
            service.joinChannel(channel);
            expect(socket.emit).toHaveBeenCalled();
        });
    });

    // describe('handleJoinChannel', () => {
    //     it('should add channel', () => {
    //         service.handleJoinChannel({} as Channel);
    //         expect(service.channels.length).toEqual(1);
    //     });

    //     it('should emit to joinedChannel', () => {
    //         spyOn(service.joinedChannel, 'next');
    //         service.handleJoinChannel({} as Channel);
    //         expect(service.joinedChannel.next).toHaveBeenCalled();
    //     });
    // });

    // describe('handleChannelQuit', () => {
    //     it('should remove channel', () => {
    //         const channel: ClientChannel = {
    //             id: '1',
    //             name: 'channel',
    //             messages: [],
    //             canQuit: true,
    //         };
    //         service.channels = [channel];
    //         service.handleChannelQuit(channel);
    //         expect(service.channels.length).toEqual(0);
    //     });
    // });

    // describe('handleNewMessage', () => {
    //     it('should add message', () => {
    //         const channel: ClientChannel = {
    //             id: '1',
    //             name: 'channel',
    //             messages: [],
    //             canQuit: true,
    //         };
    //         service.channels = [channel];
    //         service.handleNewMessage({ channel, message: {} as ChatMessage } as ChannelMessage);
    //         expect(service.channels[0].messages.length).toEqual(1);
    //     });
    // });
});
