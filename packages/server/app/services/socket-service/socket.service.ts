import { HttpException } from '@app/classes/http-exception/http-exception';
import { INVALID_ID_FOR_SOCKET, SOCKET_SERVICE_NOT_INITIALIZED } from '@app/constants/services-errors';
import { ChatService } from '@app/services/chat-service/chat.service';
import { isIdVirtualPlayer } from '@app/utils/is-id-virtual-player/is-id-virtual-player';
import { ClientEvents, ServerEvents } from '@common/events/events';
import * as http from 'http';
import { StatusCodes } from 'http-status-codes';
import * as io from 'socket.io';
import { Service } from 'typedi';
import { AuthentificationService } from '@app/services/authentification-service/authentification.service';
import {
    CanceledGameEmitArgs,
    CleanupEmitArgs,
    GameUpdateEmitArgs,
    HighScoresEmitArgs,
    JoinerLeaveGameEmitArgs,
    JoinRequestEmitArgs,
    LobbiesUpdateEmitArgs,
    NewMessageEmitArgs,
    RejectEmitArgs,
    SocketEmitEvents,
    StartGameEmitArgs,
} from './socket-types';

@Service()
export class SocketService {
    private sio?: io.Server;
    private sockets: Map<string, io.Socket>;

    constructor(private readonly chatService: ChatService, private readonly authentificationService: AuthentificationService) {
        this.sockets = new Map();
    }

    initialize(server: http.Server): void {
        this.sio = new io.Server<ClientEvents, ServerEvents>(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
    }

    handleSockets(): void {
        if (this.sio === undefined) throw new HttpException(SOCKET_SERVICE_NOT_INITIALIZED, StatusCodes.INTERNAL_SERVER_ERROR);

        this.sio.on('connection', (socket) => {
            console.log('Socket with id ' + socket.id);
            this.sockets.set(socket.id, socket);
            socket.emit('initialization', { id: socket.id });

            // Authetififcation
            socket.on('user:authentificate', (token: string) => {
                console.log('Socket ' + socket.id + ' send the token' + token);
                try {
                    this.authentificationService.authentificateSocket(socket.id, token);
                } catch (error) {
                    this.authentificationService.disconnectSocket(socket.id);
                    this.sockets.delete(socket.id);
            });

            this.chatService.configureSocket(socket);
            socket.on('disconnect', () => {
                console.log('Socket ' + socket.id + ' disconnected');
                this.authentificationService.disconnectSocket(socket.id);
                this.sockets.delete(socket.id);
            });
        });
    }

    addToRoom(socketId: string, room: string): void {
        if (this.sio === undefined) throw new HttpException(SOCKET_SERVICE_NOT_INITIALIZED, StatusCodes.INTERNAL_SERVER_ERROR);
        const socket = this.getSocket(socketId);
        socket.join(room);
    }

    removeFromRoom(socketId: string, room: string): void {
        if (this.sio === undefined) throw new HttpException(SOCKET_SERVICE_NOT_INITIALIZED, StatusCodes.INTERNAL_SERVER_ERROR);
        const socket = this.getSocket(socketId);
        socket.leave(room);
    }

    deleteRoom(roomName: string): void {
        if (this.sio === undefined) throw new HttpException(SOCKET_SERVICE_NOT_INITIALIZED, StatusCodes.INTERNAL_SERVER_ERROR);
        this.sio.sockets.in(roomName).socketsLeave(roomName);
    }

    doesRoomExist(roomName: string): boolean {
        if (this.sio === undefined) throw new HttpException(SOCKET_SERVICE_NOT_INITIALIZED, StatusCodes.INTERNAL_SERVER_ERROR);
        return this.sio.sockets.adapter.rooms.get(roomName) !== undefined;
    }

    getSocket(id: string): io.Socket {
        const socket = this.sockets.get(id);
        if (!socket) throw new HttpException(INVALID_ID_FOR_SOCKET, StatusCodes.NOT_FOUND);
        return socket;
    }

    // Required for signature overload. This forces us to use only the correct payload
    // for the current emit and prevents us from emitting incorrect arguments which
    // would cause errors on the client side
    /* eslint-disable no-dupe-class-members */
    emitToRoom(id: string, ev: 'gameUpdate', ...args: GameUpdateEmitArgs[]): void;
    emitToRoom(id: string, ev: 'joinRequest', ...args: JoinRequestEmitArgs[]): void;
    emitToRoom(id: string, ev: 'startGame', ...args: StartGameEmitArgs[]): void;
    emitToRoom(id: string, ev: 'canceledGame', ...args: CanceledGameEmitArgs[]): void;
    emitToRoom(id: string, ev: 'rejected', ...args: RejectEmitArgs[]): void;
    emitToRoom(id: string, ev: 'lobbiesUpdate', ...args: LobbiesUpdateEmitArgs[]): void;
    emitToRoom(id: string, ev: 'newMessage', ...args: NewMessageEmitArgs[]): void;
    emitToRoom(id: string, ev: '_test_event', ...args: unknown[]): void;
    emitToRoom<T>(room: string, ev: SocketEmitEvents, ...args: T[]): void {
        if (this.sio === undefined) throw new HttpException(SOCKET_SERVICE_NOT_INITIALIZED, StatusCodes.INTERNAL_SERVER_ERROR);

        this.sio.to(room).emit(ev, ...args);
    }

    emitToSocket(id: string, ev: 'gameUpdate', ...args: GameUpdateEmitArgs[]): void;
    emitToSocket(id: string, ev: 'joinRequest', ...args: JoinRequestEmitArgs[]): void;
    emitToSocket(id: string, ev: 'startGame', ...args: StartGameEmitArgs[]): void;
    emitToSocket(id: string, ev: 'canceledGame', ...args: CanceledGameEmitArgs[]): void;
    emitToSocket(id: string, ev: 'joinerLeaveGame', ...args: JoinerLeaveGameEmitArgs[]): void;
    emitToSocket(id: string, ev: 'rejected', ...args: RejectEmitArgs[]): void;
    emitToSocket(id: string, ev: 'lobbiesUpdate', ...args: LobbiesUpdateEmitArgs[]): void;
    emitToSocket(id: string, ev: 'newMessage', ...args: NewMessageEmitArgs[]): void;
    emitToSocket(id: string, ev: 'highScoresList', ...args: HighScoresEmitArgs[]): void;
    emitToSocket(id: string, ev: 'cleanup', ...args: CleanupEmitArgs[]): void;
    emitToSocket(id: string, ev: '_test_event', ...args: unknown[]): void;
    emitToSocket<T>(id: string, ev: SocketEmitEvents, ...args: T[]): void {
        if (this.sio === undefined) throw new HttpException(SOCKET_SERVICE_NOT_INITIALIZED, StatusCodes.INTERNAL_SERVER_ERROR);
        if (isIdVirtualPlayer(id)) return;
        this.getSocket(id).emit(ev, ...args);
    }
}
