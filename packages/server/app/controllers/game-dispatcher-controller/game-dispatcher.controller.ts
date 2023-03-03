/* eslint-disable max-lines */
import { GameUpdateData } from '@app/classes/communication/game-update-data';
import { PlayerData } from '@app/classes/communication/player-data';
import { CreateGameRequest, GameRequest, GroupsRequest } from '@app/classes/communication/request';
import { HttpException } from '@app/classes/http-exception/http-exception';
import { UserId } from '@app/classes/user/connected-user-types';
import { SECONDS_TO_MILLISECONDS, TIME_TO_RECONNECT } from '@app/constants/controllers-constants';
import { GAME_IS_OVER, MAX_ROUND_TIME_REQUIRED, PLAYER_NAME_REQUIRED } from '@app/constants/controllers-errors';
import { SYSTEM_ID } from '@app/constants/game-constants';
import { BaseController } from '@app/controllers/base-controller';
import { ActiveGameService } from '@app/services/active-game-service/active-game.service';
import { GameDispatcherService } from '@app/services/game-dispatcher-service/game-dispatcher.service';
import { SocketService } from '@app/services/socket-service/socket.service';
import { Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';
import { isIdVirtualPlayer } from '@app/utils/is-id-virtual-player/is-id-virtual-player';
import { fillPlayerData } from '@app/utils/fill-player-data/fill-player-data';
import { ACCEPT, REJECT } from '@app/constants/services-constants/game-dispatcher-const';
import { AuthentificationService } from '@app/services/authentification-service/authentification.service';
import { Group, GroupData } from '@common/models/group';
import { PublicUser } from '@common/models/user';
import { GameVisibility } from '@common/models/game-visibility';
import Player from '@app/classes/player/player';
@Service()
export class GameDispatcherController extends BaseController {
    constructor(
        private gameDispatcherService: GameDispatcherService,
        private socketService: SocketService,
        private activeGameService: ActiveGameService,
        private authentificationService: AuthentificationService,
    ) {
        super('/api/games');

        this.activeGameService.playerLeftEvent.on(
            'playerLeftFeedback',
            (gameId: string, endOfGameMessages: string[], updatedData: GameUpdateData) => {
                this.handlePlayerLeftFeedback(gameId, endOfGameMessages, updatedData);
            },
        );
    }

    protected configure(router: Router): void {
        router.post('/', async (req: CreateGameRequest, res: Response, next) => {
            const body: GroupData = req.body;
            const userId: UserId = req.body.idUser;
            const playerId = this.authentificationService.connectedUsers.getSocketId(userId);
            try {
                const group = await this.handleCreateGame(body, userId, playerId);
                res.status(StatusCodes.CREATED).send({ group });
            } catch (exception) {
                next(exception);
            }
        });

        router.get('/', (req: GroupsRequest, res: Response, next) => {
            const userId: UserId = req.body.idUser;
            const playerId = this.authentificationService.connectedUsers.getSocketId(userId);
            try {
                this.handleGroupsRequest(playerId);

                res.status(StatusCodes.NO_CONTENT).send();
            } catch (exception) {
                next(exception);
            }
        });

        router.post('/:gameId/players/join', async (req: GameRequest, res: Response, next) => {
            const { gameId } = req.params;
            const userId: UserId = req.body.idUser;
            const { password }: { password: string } = req.body;

            const playerId = this.authentificationService.connectedUsers.getSocketId(userId);
            const publicUser = await this.authentificationService.getUserById(userId);
            try {
                await this.handleJoinGame(gameId, playerId, publicUser, password);

                res.status(StatusCodes.NO_CONTENT).send();
            } catch (exception) {
                next(exception);
            }
        });

        router.patch('/:gameId', async (req: GameRequest, res: Response, next) => {
            const { gameId } = req.params;
            const userId: UserId = req.body.idUser;

            const playerId = this.authentificationService.connectedUsers.getSocketId(userId);
            const publicUser = await this.authentificationService.getUserById(userId);
            try {
                await this.handleGetGroupUpdates(gameId, playerId, publicUser);

                res.status(StatusCodes.NO_CONTENT).send();
            } catch (exception) {
                next(exception);
            }
        });

        router.post('/:gameId/players/accept', async (req: GameRequest, res: Response, next) => {
            const { gameId } = req.params;
            const { opponentName }: { opponentName: string } = req.body;
            const userId: UserId = req.body.idUser;
            const playerId = this.authentificationService.connectedUsers.getSocketId(userId);
            try {
                await this.handleAcceptRequest(gameId, playerId, opponentName);

                res.status(StatusCodes.NO_CONTENT).send();
            } catch (exception) {
                next(exception);
            }
        });

        router.post('/:gameId/players/reject', async (req: GameRequest, res: Response, next) => {
            const { gameId } = req.params;
            const { opponentName }: { opponentName: string } = req.body;
            const userId: UserId = req.body.idUser;
            const playerId = this.authentificationService.connectedUsers.getSocketId(userId);
            try {
                await this.handleRejectRequest(gameId, playerId, opponentName);

                res.status(StatusCodes.NO_CONTENT).send();
            } catch (exception) {
                next(exception);
            }
        });

        router.post('/:gameId/players/start', async (req: GameRequest, res: Response, next) => {
            const { gameId } = req.params;
            const userId: UserId = req.body.idUser;
            const playerId = this.authentificationService.connectedUsers.getSocketId(userId);
            try {
                await this.handleStartRequest(gameId, playerId);

                res.status(StatusCodes.NO_CONTENT).send();
            } catch (exception) {
                next(exception);
            }
        });

        router.delete('/:gameId/players/cancel', async (req: GameRequest, res: Response, next) => {
            const { gameId } = req.params;
            const userId: UserId = req.body.idUser;
            const playerId = this.authentificationService.connectedUsers.getSocketId(userId);
            try {
                await this.handleCancelGame(gameId, playerId);

                res.status(StatusCodes.NO_CONTENT).send();
            } catch (exception) {
                next(exception);
            }
        });

        router.delete('/:gameId/players/leave', async (req: GameRequest, res: Response, next) => {
            const { gameId } = req.params;
            const userId: UserId = req.body.idUser;
            const playerId = this.authentificationService.connectedUsers.getSocketId(userId);

            try {
                await this.handleLeave(gameId, playerId);

                res.status(StatusCodes.NO_CONTENT).send();
            } catch (exception) {
                next(exception);
            }
        });

        // TODO: See if this really works
        router.post('/:gameId/players/reconnect', (req: GameRequest, res: Response, next) => {
            const { gameId } = req.params;
            const { newPlayerId }: { newPlayerId: string } = req.body;
            const userId: UserId = req.body.idUser;
            const playerId = this.authentificationService.connectedUsers.getSocketId(userId);
            try {
                this.handleReconnection(gameId, playerId, newPlayerId);

                res.status(StatusCodes.NO_CONTENT).send();
            } catch (exception) {
                next(exception);
            }
        });

        router.delete('/:gameId/players/disconnect', (req: GameRequest, res: Response, next) => {
            const { gameId } = req.params;
            const userId: UserId = req.body.idUser;
            const playerId = this.authentificationService.connectedUsers.getSocketId(userId);
            try {
                this.handleDisconnection(gameId, playerId);

                res.status(StatusCodes.NO_CONTENT).send();
            } catch (exception) {
                next(exception);
            }
        });
    }

    private async handleCancelGame(gameId: string, playerId: string): Promise<void> {
        const waitingRoom = this.gameDispatcherService.getMultiplayerGameFromId(gameId);
        this.socketService.emitToRoomNoSender(gameId, playerId, 'cancelledGroup', waitingRoom.getConfig().player1.publicUser);
        for (const requestingPlayer of waitingRoom.requestingPlayers) {
            this.socketService.emitToSocket(requestingPlayer.id, 'cancelledGroup', waitingRoom.getConfig().player1.publicUser);
        }
        await this.gameDispatcherService.cancelGame(gameId, playerId);

        this.handleGroupsUpdate();
    }

    private async handleGetGroupUpdates(gameId: string, playerId: string, publicUser: PublicUser): Promise<void> {
        const waitingRoom = this.gameDispatcherService.getMultiplayerGameFromId(gameId);
        waitingRoom.requestingPlayers.push(new Player(playerId, publicUser));
        this.socketService.getSocket(playerId).leave(this.gameDispatcherService.getGroupsRoom().getId());
    }

    private async handleLeave(gameId: string, playerId: string): Promise<void> {
        if (this.gameDispatcherService.isGameInWaitingRooms(gameId)) {
            if (this.gameDispatcherService.isPlayerFromAcceptedPlayers(gameId, playerId)) {
                this.socketService.removeFromRoom(playerId, gameId);

                const group = await this.gameDispatcherService.leaveGroupRequest(gameId, playerId);
                this.socketService.emitToRoom(gameId, 'userLeftGroup', group);
                this.handleGroupsUpdate();
            } else {
                const requestingPlayers = this.gameDispatcherService.removeRequestingPlayer(gameId, playerId);
                const config = this.gameDispatcherService.getMultiplayerGameFromId(gameId).getConfig();
                if (config.gameVisibility === GameVisibility.Private) {
                    this.socketService.emitToSocket(config.player1.id, 'joinRequestCancelled', requestingPlayers);
                }
            }
            return;
        }

        await this.activeGameService.handlePlayerLeaves(gameId, playerId);
    }

    private handlePlayerLeftFeedback(gameId: string, endOfGameMessages: string[], updatedData: GameUpdateData): void {
        this.socketService.emitToRoom(gameId, 'gameUpdate', updatedData);
        this.socketService.emitToRoom(gameId, 'newMessage', {
            content: endOfGameMessages.join('<br>'),
            senderId: SYSTEM_ID,
            gameId,
        });
    }

    private async handleCreateGame(groupData: GroupData, userId: UserId, playerId: string): Promise<Group | void> {
        if (groupData.maxRoundTime === undefined) throw new HttpException(MAX_ROUND_TIME_REQUIRED, StatusCodes.BAD_REQUEST);

        const group = await this.gameDispatcherService.createMultiplayerGame(groupData, userId, playerId);
        this.handleGroupsUpdate();
        return group;
    }

    private async handleJoinGame(gameId: string, playerId: string, publicUser: PublicUser, password: string): Promise<void> {
        const waitingRoom = await this.gameDispatcherService.requestJoinGame(gameId, playerId, publicUser, password);
        if (waitingRoom.getConfig().gameVisibility === GameVisibility.Private) {
            this.socketService.emitToSocket(
                waitingRoom.getConfig().player1.id,
                'joinRequest',
                waitingRoom.requestingPlayers.map((player) => player.publicUser),
            );
        } else {
            this.socketService.addToRoom(playerId, gameId);
            this.socketService.emitToRoom(gameId, 'acceptJoinRequest', waitingRoom.convertToGroup());
        }

        this.socketService.getSocket(playerId).leave(this.gameDispatcherService.getGroupsRoom().getId());
        this.handleGroupsUpdate();
    }

    private async handleAcceptRequest(gameId: string, playerId: string, playerName: string): Promise<void> {
        if (playerName === undefined) throw new HttpException(PLAYER_NAME_REQUIRED, StatusCodes.BAD_REQUEST);

        const [acceptedPlayer, group] = await this.gameDispatcherService.handleJoinRequest(gameId, playerId, playerName, ACCEPT);

        this.socketService.addToRoom(acceptedPlayer.id, gameId);
        this.socketService.emitToRoom(gameId, 'acceptJoinRequest', group);
        this.handleGroupsUpdate();
    }

    private async handleRejectRequest(gameId: string, playerId: string, playerName: string): Promise<void> {
        if (playerName === undefined) throw new HttpException(PLAYER_NAME_REQUIRED, StatusCodes.BAD_REQUEST);
        const [rejectedPlayer, group] = await this.gameDispatcherService.handleJoinRequest(gameId, playerId, playerName, REJECT);
        this.socketService.emitToSocket(rejectedPlayer.id, 'rejectJoinRequest', group.user1);
    }

    private async handleStartRequest(gameId: string, playerId: string): Promise<void> {
        const waitingRoom = this.gameDispatcherService.getMultiplayerGameFromId(gameId);
        for (const requestingPlayer of waitingRoom.requestingPlayers) {
            this.socketService.emitToSocket(requestingPlayer.id, 'rejectJoinRequest', waitingRoom.getConfig().player1.publicUser);
        }

        const gameConfig = this.gameDispatcherService.startRequest(gameId, playerId);

        const startGameData = await this.activeGameService.beginGame(gameId, gameConfig.idChannel, gameConfig);

        this.socketService.emitToRoom(gameId, 'startGame', startGameData);
        this.handleGroupsUpdate();

        if (isIdVirtualPlayer(startGameData.round.playerData.id)) {
            this.gameDispatcherService
                .getVirtualPlayerService()
                .triggerVirtualPlayerTurn(startGameData, this.activeGameService.getGame(gameId, startGameData.round.playerData.id));
        }
    }

    private handleGroupsRequest(playerId: string): void {
        const waitingRooms = this.gameDispatcherService.getAvailableWaitingRooms();
        this.socketService.addToRoom(playerId, this.gameDispatcherService.getGroupsRoom().getId());
        this.socketService.emitToSocket(playerId, 'groupsUpdate', waitingRooms);
    }

    private handleGroupsUpdate(): void {
        const waitingRooms = this.gameDispatcherService.getAvailableWaitingRooms();
        this.socketService.emitToRoom(this.gameDispatcherService.getGroupsRoom().getId(), 'groupsUpdate', waitingRooms);
    }

    private handleReconnection(gameId: string, playerId: string, newPlayerId: string): void {
        const game = this.activeGameService.getGame(gameId, playerId);

        if (game.areGameOverConditionsMet()) throw new HttpException(GAME_IS_OVER, StatusCodes.FORBIDDEN);
        const player = game.getPlayer(playerId);
        player.id = newPlayerId;
        player.isConnected = true;
        this.socketService.addToRoom(newPlayerId, gameId);

        const data = game.createStartGameData();
        this.socketService.emitToSocket(newPlayerId, 'startGame', data);

        const newPlayerData: PlayerData = { id: playerId, newId: newPlayerId };

        const gameUpdateData: GameUpdateData = {};
        fillPlayerData(gameUpdateData, game.getPlayerNumber(player), newPlayerData);

        this.socketService.emitToRoomNoSender(gameId, newPlayerId, 'gameUpdate', gameUpdateData);
    }

    private handleDisconnection(gameId: string, playerId: string): void {
        const game = this.activeGameService.getGame(gameId, playerId);

        if (!game.areGameOverConditionsMet()) {
            const disconnectedPlayer = game.getPlayer(playerId);
            disconnectedPlayer.isConnected = false;
            setTimeout(() => {
                if (!disconnectedPlayer.isConnected) {
                    this.handleLeave(gameId, playerId);
                }
            }, TIME_TO_RECONNECT * SECONDS_TO_MILLISECONDS);
        }
    }
}
