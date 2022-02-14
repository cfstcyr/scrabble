import { CreateGameRequest, GameRequest, LobbiesRequest } from '@app/classes/communication/request';
import { GameConfigData } from '@app/classes/game/game-config';
import { HttpException } from '@app/classes/http.exception';
import { ActiveGameService } from '@app/services/active-game-service/active-game.service';
import { GameDispatcherService } from '@app/services/game-dispatcher-service/game-dispatcher.service';
import { SocketService } from '@app/services/socket-service/socket.service';
import { validateName } from '@app/utils/validate-name';
import { Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';
import {
    DICTIONARY_REQUIRED,
    GAME_IS_OVER,
    GAME_TYPE_REQUIRED,
    MAX_ROUND_TIME_REQUIRED,
    NAME_IS_INVALID,
    PLAYER_NAME_REQUIRED,
} from '@app/constants/controllers-errors';

@Service()
export class GameDispatcherController {
    router: Router;

    constructor(
        private readonly gameDispatcherService: GameDispatcherService,
        private readonly socketService: SocketService,
        private readonly activeGameService: ActiveGameService,
    ) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.post('/games/:playerId', (req: CreateGameRequest, res: Response) => {
            const { playerId } = req.params;
            const body: Omit<GameConfigData, 'playerId'> = req.body;

            try {
                const gameId = this.handleCreateGame({ playerId, ...body });

                res.status(StatusCodes.CREATED).send({ gameId });
            } catch (e) {
                HttpException.sendError(e, res);
            }
        });

        this.router.get('/games/:playerId', (req: LobbiesRequest, res: Response) => {
            const { playerId } = req.params;
            try {
                this.handleLobbiesRequest(playerId);

                res.status(StatusCodes.NO_CONTENT).send();
            } catch (e) {
                HttpException.sendError(e, res);
            }
        });

        this.router.post('/games/:gameId/player/:playerId/join', (req: GameRequest, res: Response) => {
            const { gameId, playerId } = req.params;
            const { playerName }: { playerName: string } = req.body;

            try {
                this.handleJoinGame(gameId, playerId, playerName);

                res.status(StatusCodes.NO_CONTENT).send();
            } catch (e) {
                HttpException.sendError(e, res);
            }
        });

        this.router.post('/games/:gameId/player/:playerId/accept', (req: GameRequest, res: Response) => {
            const { gameId, playerId } = req.params;
            const { opponentName }: { opponentName: string } = req.body;

            try {
                this.handleAcceptRequest(gameId, playerId, opponentName);

                res.status(StatusCodes.NO_CONTENT).send();
            } catch (e) {
                HttpException.sendError(e, res);
            }
        });

        this.router.post('/games/:gameId/player/:playerId/reject', (req: GameRequest, res: Response) => {
            const { gameId, playerId } = req.params;
            const { opponentName }: { opponentName: string } = req.body;

            try {
                this.handleRejectRequest(gameId, playerId, opponentName);

                res.status(StatusCodes.NO_CONTENT).send();
            } catch (e) {
                HttpException.sendError(e, res);
            }
        });

        this.router.delete('/games/:gameId/player/:playerId/cancel', (req: GameRequest, res: Response) => {
            const { gameId, playerId } = req.params;

            try {
                this.handleCancelGame(gameId, playerId);

                res.status(StatusCodes.NO_CONTENT).send();
            } catch (e) {
                HttpException.sendError(e, res);
            }
        });

        this.router.delete('/games/:gameId/player/:playerId/leave', (req: GameRequest, res: Response) => {
            const { gameId, playerId } = req.params;

            try {
                this.handleLobbyLeave(gameId, playerId);

                res.status(StatusCodes.NO_CONTENT).send();
            } catch (e) {
                HttpException.sendError(e, res);
            }
        });

        this.router.post('/games/:gameId/player/:playerId/reconnect', (req: GameRequest, res: Response) => {
            const { gameId, playerId } = req.params;
            const { newPlayerId }: { newPlayerId: string } = req.body;

            try {
                this.handleReconnection(gameId, playerId, newPlayerId);

                res.status(StatusCodes.NO_CONTENT).send();
            } catch (e) {
                HttpException.sendError(e, res);
            }
        });

        this.router.delete('/games/:gameId/player/:playerId/disconnect', (req: GameRequest, res: Response) => {
            const { gameId, playerId } = req.params;

            try {
                this.handleDisconnection(gameId, playerId);

                res.status(StatusCodes.NO_CONTENT).send();
            } catch (e) {
                HttpException.sendError(e, res);
            }
        });
    }

    private handleCancelGame(gameId: string, playerId: string) {
        const waitingRoom = this.gameDispatcherService.getGameFromId(gameId);
        if (waitingRoom.joinedPlayer) {
            this.socketService.emitToSocket(waitingRoom.joinedPlayer.id, 'canceledGame', { name: waitingRoom.getConfig().player1.name });
        }
        this.gameDispatcherService.cancelGame(gameId, playerId);

        this.handleLobbiesUpdate();
    }

    private handleLobbyLeave(gameId: string, playerId: string) {
        const result = this.gameDispatcherService.leaveLobbyRequest(gameId, playerId);

        this.socketService.emitToSocket(result[0], 'joinerLeaveGame', { name: result[1] });
        this.handleLobbiesUpdate();
    }

    private handleCreateGame(config: GameConfigData): string {
        if (config.playerName === undefined) throw new HttpException(PLAYER_NAME_REQUIRED, StatusCodes.BAD_REQUEST);
        if (config.gameType === undefined) throw new HttpException(GAME_TYPE_REQUIRED, StatusCodes.BAD_REQUEST);
        if (config.maxRoundTime === undefined) throw new HttpException(MAX_ROUND_TIME_REQUIRED, StatusCodes.BAD_REQUEST);
        if (config.dictionary === undefined) throw new HttpException(DICTIONARY_REQUIRED, StatusCodes.BAD_REQUEST);

        if (!validateName(config.playerName)) throw new HttpException(NAME_IS_INVALID, StatusCodes.BAD_REQUEST);

        const gameId = this.gameDispatcherService.createMultiplayerGame(config);

        this.socketService.addToRoom(config.playerId, gameId);
        this.handleLobbiesUpdate();
        return gameId;
    }

    private handleJoinGame(gameId: string, playerId: string, playerName: string) {
        if (playerName === undefined) throw new HttpException(PLAYER_NAME_REQUIRED, StatusCodes.BAD_REQUEST);
        if (!validateName(playerName)) throw new HttpException(NAME_IS_INVALID, StatusCodes.BAD_REQUEST);
        this.gameDispatcherService.requestJoinGame(gameId, playerId, playerName);
        this.socketService.emitToRoom(gameId, 'joinRequest', { name: playerName });

        this.socketService.getSocket(playerId).leave(this.gameDispatcherService.getLobbiesRoom().getId());
        this.handleLobbiesUpdate();
    }

    private async handleAcceptRequest(gameId: string, playerId: string, playerName: string) {
        if (playerName === undefined) throw new HttpException(PLAYER_NAME_REQUIRED, StatusCodes.BAD_REQUEST);

        const startGameData = await this.gameDispatcherService.acceptJoinRequest(gameId, playerId, playerName);

        this.socketService.addToRoom(startGameData.player2.id, gameId);
        this.socketService.emitToRoom(gameId, 'startGame', startGameData);
    }

    private handleRejectRequest(gameId: string, playerId: string, playerName: string) {
        if (playerName === undefined) throw new HttpException(PLAYER_NAME_REQUIRED, StatusCodes.BAD_REQUEST);
        const [rejectedPlayer, hostName] = this.gameDispatcherService.rejectJoinRequest(gameId, playerId, playerName);
        this.socketService.emitToSocket(rejectedPlayer.id, 'rejected', { name: hostName });
        this.handleLobbiesUpdate();
    }

    private handleLobbiesRequest(playerId: string) {
        const waitingRooms = this.gameDispatcherService.getAvailableWaitingRooms();
        this.socketService.addToRoom(playerId, this.gameDispatcherService.getLobbiesRoom().getId());
        this.socketService.emitToSocket(playerId, 'lobbiesUpdate', waitingRooms);
    }

    private handleLobbiesUpdate() {
        const waitingRooms = this.gameDispatcherService.getAvailableWaitingRooms();
        this.socketService.emitToRoom(this.gameDispatcherService.getLobbiesRoom().getId(), 'lobbiesUpdate', waitingRooms);
    }

    private handleReconnection(gameId: string, playerId: string, newPlayerId: string) {
        const game = this.activeGameService.getGame(gameId, playerId);

        console.log(`handleReconnection gameId : ${gameId}`);
        console.log(`handleReconnection playerId : ${playerId}`);
        console.log(`handleReconnection newPlayerId : ${newPlayerId}`);

        // TODO: Add condition once we have singleplayer games
        // if (!game.isGameOver()&& game.gameMode === gameMode.multiplayer)
        if (game.isGameOver()) {
            throw new HttpException(GAME_IS_OVER, StatusCodes.FORBIDDEN);
        }
        const player = game.getRequestingPlayer(playerId);
        player.id = newPlayerId;
        player.isConnected = true;
        this.socketService.addToRoom(newPlayerId, gameId);
        const data = game.getInfoData();
        this.socketService.emitToSocket(newPlayerId, 'gameInfo', data);
    }

    private handleDisconnection(gameId: string, playerId: string) {
        console.log(`handleDisconnection gameId : ${gameId}`);
        console.log(`handleDisconnection playerId : ${playerId}`);

        const game = this.activeGameService.getGame(gameId, playerId);
        // TODO: Add condition once we have singleplayer games
        // if (!game.isGameOver()&& game.gameMode === gameMode.multiplayer)
        if (!game.isGameOver()) {
            const disconnectedPlayer = game.getRequestingPlayer(playerId);
            disconnectedPlayer.isConnected = false;
            setTimeout(() => {
                console.log('setTimeout EXPIRE ');

                if (!disconnectedPlayer.isConnected) {
                    // END GAME
                    // eslint-disable-next-line no-console
                    console.log('setTimeout GIVEUP ');
                }
            }, TIME_TO_RECONNECT);
        }
    }
}

const TIME_TO_RECONNECT = 5000;
