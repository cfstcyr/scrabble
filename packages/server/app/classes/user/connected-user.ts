import { SOCKET_ID_IS_REQUIRED, USER_ID_IS_REQUIRED } from '@app/constants/controllers-errors';

type UserId = number;
type SocketId = string;

export class ConnectedUser {
    private socketUserMap: Map<SocketId, UserId>;
    private userSocketMap: Map<UserId, SocketId>;

    constructor() {
        this.socketUserMap = new Map();
        this.userSocketMap = new Map();
    }

    connect(socketId: SocketId, userId: UserId): void {
        if (!socketId) throw new Error(SOCKET_ID_IS_REQUIRED);
        if (!userId) throw new Error(USER_ID_IS_REQUIRED);

        this.socketUserMap.set(socketId, userId);
        this.userSocketMap.set(userId, socketId);
    }

    disconnect(id: SocketId | UserId) {
        const { socketId, userId } = this.resolveIds(id);

        if (socketId) this.socketUserMap.delete(socketId);
        if (userId) this.userSocketMap.delete(userId);
    }

    isConnected(id: SocketId | UserId): boolean {
        const { socketId, userId } = this.resolveIds(id);

        return socketId ? this.socketUserMap.has(socketId) : userId ? this.userSocketMap.has(userId) : false;
    }

    getSocketId(id: SocketId | UserId): SocketId | undefined {
        const { socketId, userId } = this.resolveIds(id);

        return socketId ? socketId : userId ? this.userSocketMap.get(userId) : undefined;
    }

    getUserId(id: SocketId | UserId): UserId | undefined {
        const { socketId, userId } = this.resolveIds(id);

        return userId ? userId : socketId ? this.socketUserMap.get(socketId) : undefined;
    }

    private resolveIds(id: SocketId | UserId) {
        let socketId: SocketId | undefined;
        let userId: UserId | undefined;

        if (typeof id === 'string') {
            socketId = id;
            userId = this.socketUserMap.get(socketId);
        } else {
            userId = id;
            socketId = this.userSocketMap.get(userId);
        }

        return { socketId, userId };
    }
}
