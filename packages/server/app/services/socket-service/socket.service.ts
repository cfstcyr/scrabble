import { ServerSocket } from '@app/classes/communication/socket-type';
import { HttpException } from '@app/classes/http-exception/http-exception';
import { INVALID_ID_FOR_SOCKET, NO_TOKEN, SOCKET_SERVICE_NOT_INITIALIZED } from '@app/constants/services-errors';
import { AuthentificationService } from '@app/services/authentification-service/authentification.service';
import { env } from '@app/utils/environment/environment';
import { isIdVirtualPlayer } from '@app/utils/is-id-virtual-player/is-id-virtual-player';
import { ClientEvents, ServerEvents } from '@common/events/events';
import { NextFunction } from 'express';
import { SocketErrorResponse } from '@common/models/error';
import { EventEmitter } from 'events';
import * as http from 'http';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import * as io from 'socket.io';
import { Service } from 'typedi';
import {
    CanceledGameEmitArgs,
    CleanupEmitArgs,
    GameUpdateEmitArgs,
    HighScoresEmitArgs,
    JoinerLeaveGameEmitArgs,
    JoinRequestEmitArgs,
    GroupsUpdateEmitArgs,
    NewMessageEmitArgs,
    PlayerJoinedEmitArgs,
    RejectEmitArgs,
    SocketEmitEvents,
    StartGameEmitArgs,
} from './socket-types';
import { SOCKET_CONFIGURE_EVENT_NAME } from '@app/constants/services-constants/socket-consts';

@Service()
export class SocketService {
    private sio?: io.Server;
    private sockets: Map<string, io.Socket>;
    private configureSocketsEvent: EventEmitter;

    constructor(private readonly authentificationService: AuthentificationService) {
        this.sockets = new Map();
        this.configureSocketsEvent = new EventEmitter();
    }

    static handleError(error: Error, socket: ServerSocket): void {
        const status = error instanceof HttpException ? error.status : StatusCodes.INTERNAL_SERVER_ERROR;

        const response: SocketErrorResponse = {
            message: error.message,
            error: getReasonPhrase(status),
            status,
        };

        if (env.isDev) {
            response.stack = error.stack?.split('\n');
        }

        if (!env.isProd) {
            // eslint-disable-next-line no-console
            console.error(error);
        }

        socket.emit('error', response);
    }

    initialize(server: http.Server): void {
        this.sio = new io.Server<ClientEvents, ServerEvents>(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
    }

    handleSockets(): void {
        if (this.sio === undefined) throw new HttpException(SOCKET_SERVICE_NOT_INITIALIZED, StatusCodes.INTERNAL_SERVER_ERROR);

        this.sio.use(async (socket: io.Socket, next: NextFunction) => {
            const token = socket.handshake.auth.token;

            if (token) {
                try {
                    await this.authentificationService.authentificateSocket(socket, token);
                    return next();
                } catch (err) {
                    return next(new Error(err));
                }
            } else {
                next(new Error(NO_TOKEN));
            }
        });

        this.sio.on('connection', (socket) => {
            this.sockets.set(socket.id, socket);
            socket.emit('initialization', { id: socket.id });

            this.configureSocketsEvent.emit(SOCKET_CONFIGURE_EVENT_NAME, socket);
            socket.on('disconnect', () => {
                this.handleDisconnect(socket);
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
    emitToRoom(id: string, ev: 'player_joined', ...args: PlayerJoinedEmitArgs[]): void;
    emitToRoom(id: string, ev: 'startGame', ...args: StartGameEmitArgs[]): void;
    emitToRoom(id: string, ev: 'canceledGame', ...args: CanceledGameEmitArgs[]): void;
    emitToRoom(id: string, ev: 'joinerLeaveGame', ...args: JoinerLeaveGameEmitArgs[]): void;
    emitToRoom(id: string, ev: 'rejected', ...args: RejectEmitArgs[]): void;
    emitToRoom(id: string, ev: 'groupsUpdate', ...args: GroupsUpdateEmitArgs[]): void;
    emitToRoom(id: string, ev: 'newMessage', ...args: NewMessageEmitArgs[]): void;
    emitToRoom(id: string, ev: '_test_event', ...args: unknown[]): void;
    emitToRoom<T>(room: string, ev: SocketEmitEvents, ...args: T[]): void {
        if (this.sio === undefined) throw new HttpException(SOCKET_SERVICE_NOT_INITIALIZED, StatusCodes.INTERNAL_SERVER_ERROR);

        this.sio.to(room).emit(ev, ...args);
    }

    emitToSocket(id: string, ev: 'gameUpdate', ...args: GameUpdateEmitArgs[]): void;
    emitToSocket(id: string, ev: 'joinRequest', ...args: JoinRequestEmitArgs[]): void;
    emitToSocket(id: string, ev: 'player_joined', ...args: PlayerJoinedEmitArgs[]): void;
    emitToSocket(id: string, ev: 'startGame', ...args: StartGameEmitArgs[]): void;
    emitToSocket(id: string, ev: 'canceledGame', ...args: CanceledGameEmitArgs[]): void;
    emitToSocket(id: string, ev: 'joinerLeaveGame', ...args: JoinerLeaveGameEmitArgs[]): void;
    emitToSocket(id: string, ev: 'rejected', ...args: RejectEmitArgs[]): void;
    emitToSocket(id: string, ev: 'groupsUpdate', ...args: GroupsUpdateEmitArgs[]): void;
    emitToSocket(id: string, ev: 'newMessage', ...args: NewMessageEmitArgs[]): void;
    emitToSocket(id: string, ev: 'highScoresList', ...args: HighScoresEmitArgs[]): void;
    emitToSocket(id: string, ev: 'cleanup', ...args: CleanupEmitArgs[]): void;
    emitToSocket(id: string, ev: '_test_event', ...args: unknown[]): void;
    emitToSocket<T>(id: string, ev: SocketEmitEvents, ...args: T[]): void {
        if (this.sio === undefined) throw new HttpException(SOCKET_SERVICE_NOT_INITIALIZED, StatusCodes.INTERNAL_SERVER_ERROR);

        if (isIdVirtualPlayer(id)) return;
        this.getSocket(id).emit(ev, ...args);
    }

    emitToRoomNoSender(id: string, socketSenderId: string, ev: 'gameUpdate', ...args: GameUpdateEmitArgs[]): void;
    emitToRoomNoSender(id: string, socketSenderId: string, ev: 'joinRequest', ...args: JoinRequestEmitArgs[]): void;
    emitToRoomNoSender(id: string, socketSenderId: string, ev: 'player_joined', ...args: PlayerJoinedEmitArgs[]): void;
    emitToRoomNoSender(id: string, socketSenderId: string, ev: 'startGame', ...args: StartGameEmitArgs[]): void;
    emitToRoomNoSender(id: string, socketSenderId: string, ev: 'canceledGame', ...args: CanceledGameEmitArgs[]): void;
    emitToRoomNoSender(id: string, socketSenderId: string, ev: 'rejected', ...args: RejectEmitArgs[]): void;
    emitToRoomNoSender(id: string, socketSenderId: string, ev: 'groupsUpdate', ...args: GroupsUpdateEmitArgs[]): void;
    emitToRoomNoSender(id: string, socketSenderId: string, ev: 'newMessage', ...args: NewMessageEmitArgs[]): void;
    emitToRoomNoSender(id: string, socketSenderId: string, ev: '_test_event', ...args: unknown[]): void;
    emitToRoomNoSender<T>(room: string, socketSenderId: string, ev: SocketEmitEvents, ...args: T[]): void {
        if (this.sio === undefined) throw new HttpException(SOCKET_SERVICE_NOT_INITIALIZED, StatusCodes.INTERNAL_SERVER_ERROR);
        if (isIdVirtualPlayer(socketSenderId)) {
            this.sio.to(room).emit(ev, ...args);
            return;
        }

        this.getSocket(socketSenderId)
            .to(room)
            .emit(ev, ...args);
    }

    listenToInitialisationEvent(callback: (socket: ServerSocket) => void): void {
        this.configureSocketsEvent.addListener(SOCKET_CONFIGURE_EVENT_NAME, callback);
    }

    private handleDisconnect(socket: io.Socket): void {
        this.authentificationService.disconnectSocket(socket.id);
        this.sockets.delete(socket.id);
    }
}
