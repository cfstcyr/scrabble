import { GameUpdateData } from '@app/classes/communication/game-update-data';
import { PlayerData } from '@app/classes/communication/player-data';
import { CreateGameRequest, GameRequest, GroupsRequest } from '@app/classes/communication/request';
import { GameConfigData } from '@app/classes/game/game-config';
import { HttpException } from '@app/classes/http-exception/http-exception';
import { SECONDS_TO_MILLISECONDS, TIME_TO_RECONNECT } from '@app/constants/controllers-constants';
import { GAME_IS_OVER, MAX_ROUND_TIME_REQUIRED, NAME_IS_INVALID, PLAYER_NAME_REQUIRED } from '@app/constants/controllers-errors';
import { SYSTEM_ID } from '@app/constants/game-constants';
import { ActiveGameService } from '@app/services/active-game-service/active-game.service';
import { GameDispatcherService } from '@app/services/game-dispatcher-service/game-dispatcher.service';
import { SocketService } from '@app/services/socket-service/socket.service';
import { validateName } from '@app/utils/validate-name/validate-name';
import { Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';
import { BaseController } from '@app/controllers/base-controller';
import { isIdVirtualPlayer } from '@app/utils/is-id-virtual-player/is-id-virtual-player';
import { fillPlayerData } from '@app/utils/fill-player-data/fill-player-data';
import { ACCEPT, REJECT } from '@app/constants/services-constants/game-dispatcher-const';
import Player from '@app/classes/player/player';
import { UserId } from '@app/classes/user/connected-user-types';
import { AuthentificationService } from '@app/services/authentification-service/authentification.service';
import { Group } from '@common/models/group';
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
            const body: Omit<GameConfigData, 'playerId'> = req.body;
            const userId: UserId = req.body.idUser;
            const playerId = this.authentificationService.connectedUsers.getSocketId(userId);
            try {
                const group = await this.handleCreateGame({ playerId, ...body }, userId);
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

        router.post('/:gameId/players/join', (req: GameRequest, res: Response, next) => {
            const { gameId } = req.params;
            const { playerName }: { playerName: string } = req.body;
            const userId: UserId = req.body.idUser;
            const playerId = this.authentificationService.connectedUsers.getSocketId(userId);
            try {
                this.handleJoinGame(gameId, playerId, playerName);

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
        this.socketService.emitToRoomNoSender(gameId, playerId, 'canceledGame', { name: waitingRoom.getConfig().player1.name });
        await this.gameDispatcherService.cancelGame(gameId, playerId);

        this.handleGroupsUpdate();
    }

    private async handleLeave(gameId: string, playerId: string): Promise<void> {
        if (this.gameDispatcherService.isGameInWaitingRooms(gameId)) {
            const players = await this.gameDispatcherService.leaveGroupRequest(gameId, playerId);
            const playersData: PlayerData[] = players.map((player: Player) => player.convertToPlayerData());
            // TODO: Check what is returned
            this.socketService.emitToRoom(gameId, 'joinerLeaveGame', playersData);
            this.handleGroupsUpdate();
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

    private async handleCreateGame(config: GameConfigData, userId: UserId): Promise<Group | void> {
        if (config.playerName === undefined) throw new HttpException(PLAYER_NAME_REQUIRED, StatusCodes.BAD_REQUEST);
        if (config.maxRoundTime === undefined) throw new HttpException(MAX_ROUND_TIME_REQUIRED, StatusCodes.BAD_REQUEST);

        if (!validateName(config.playerName)) throw new HttpException(NAME_IS_INVALID, StatusCodes.BAD_REQUEST);

        return await this.handleCreateMultiplayerGame(config, userId);
    }

    private async handleCreateMultiplayerGame(config: GameConfigData, userId: UserId): Promise<Group> {
        const group = await this.gameDispatcherService.createMultiplayerGame(config, userId);
        this.handleGroupsUpdate();
        return group;
    }

    private handleJoinGame(gameId: string, playerId: string, playerName: string): void {
        if (playerName === undefined) throw new HttpException(PLAYER_NAME_REQUIRED, StatusCodes.BAD_REQUEST);
        if (!validateName(playerName)) throw new HttpException(NAME_IS_INVALID, StatusCodes.BAD_REQUEST);
        const waitingRoom = this.gameDispatcherService.requestJoinGame(gameId, playerId, playerName);

        // TODO: Potentially emit to whole room
        // TODO: Potentially emit more info with user info such as avatar
        this.socketService.emitToSocket(waitingRoom.getConfig().player1.id, 'joinRequest', { name: playerName });

        this.socketService.getSocket(playerId).leave(this.gameDispatcherService.getGroupsRoom().getId());
        this.handleGroupsUpdate();
    }

    private async handleAcceptRequest(gameId: string, playerId: string, playerName: string): Promise<void> {
        if (playerName === undefined) throw new HttpException(PLAYER_NAME_REQUIRED, StatusCodes.BAD_REQUEST);

        const [acceptedPlayer, players] = await this.gameDispatcherService.handleJoinRequest(gameId, playerId, playerName, ACCEPT);
        const playersData: PlayerData[] = players.map((player: Player) => player.convertToPlayerData());

        this.socketService.addToRoom(acceptedPlayer.id, gameId);
        // TODO: Check what to return
        this.socketService.emitToRoom(gameId, 'player_joined', playersData);
    }

    private async handleRejectRequest(gameId: string, playerId: string, playerName: string): Promise<void> {
        if (playerName === undefined) throw new HttpException(PLAYER_NAME_REQUIRED, StatusCodes.BAD_REQUEST);
        const [rejectedPlayer, players] = await this.gameDispatcherService.handleJoinRequest(gameId, playerId, playerName, REJECT);
        // TODO: Check what to return
        this.socketService.emitToSocket(rejectedPlayer.id, 'rejected', { name: players[0].name });
    }

    private async handleStartRequest(gameId: string, playerId: string): Promise<void> {
        const gameConfig = await this.gameDispatcherService.startRequest(gameId, playerId);
        const startGameData = await this.activeGameService.beginGame(gameId, gameConfig.idChannel, gameConfig);

        this.socketService.emitToRoom(gameId, 'startGame', startGameData);

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
