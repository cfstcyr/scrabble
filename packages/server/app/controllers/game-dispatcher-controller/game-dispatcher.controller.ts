import { GameUpdateData } from '@app/classes/communication/game-update-data';
import { LobbyData } from '@app/classes/communication/lobby-data';
import { PlayerData } from '@app/classes/communication/player-data';
import { CreateGameRequest, GameRequest, LobbiesRequest } from '@app/classes/communication/request';
import { GameConfigData } from '@app/classes/game/game-config';
import { HttpException } from '@app/classes/http-exception/http-exception';
import { SECONDS_TO_MILLISECONDS, TIME_TO_RECONNECT } from '@app/constants/controllers-constants';
import {
    DICTIONARY_REQUIRED,
    GAME_IS_OVER,
    MAX_ROUND_TIME_REQUIRED,
    NAME_IS_INVALID,
    PLAYER_LEFT_GAME,
    PLAYER_NAME_REQUIRED,
} from '@app/constants/controllers-errors';
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
@Service()
export class GameDispatcherController extends BaseController {
    constructor(
        private gameDispatcherService: GameDispatcherService,
        private socketService: SocketService,
        private activeGameService: ActiveGameService,
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
        router.post('/:playerId', async (req: CreateGameRequest, res: Response, next) => {
            const { playerId } = req.params;
            const body: Omit<GameConfigData, 'playerId'> = req.body;

            try {
                const lobbyData = await this.handleCreateGame({ playerId, ...body });
                res.status(StatusCodes.CREATED).send({ lobbyData });
            } catch (exception) {
                next(exception);
            }
        });

        router.get('/:playerId', (req: LobbiesRequest, res: Response, next) => {
            const { playerId } = req.params;
            try {
                this.handleLobbiesRequest(playerId);

                res.status(StatusCodes.NO_CONTENT).send();
            } catch (exception) {
                next(exception);
            }
        });

        router.post('/:gameId/players/:playerId/join', (req: GameRequest, res: Response, next) => {
            const { gameId, playerId } = req.params;
            const { playerName }: { playerName: string } = req.body;

            try {
                this.handleJoinGame(gameId, playerId, playerName);

                res.status(StatusCodes.NO_CONTENT).send();
            } catch (exception) {
                next(exception);
            }
        });

        router.post('/:gameId/players/:playerId/accept', async (req: GameRequest, res: Response, next) => {
            const { gameId, playerId } = req.params;
            const { opponentName }: { opponentName: string } = req.body;

            try {
                await this.handleAcceptRequest(gameId, playerId, opponentName);

                res.status(StatusCodes.NO_CONTENT).send();
            } catch (exception) {
                next(exception);
            }
        });

        router.post('/:gameId/players/:playerId/reject', (req: GameRequest, res: Response, next) => {
            const { gameId, playerId } = req.params;
            const { opponentName }: { opponentName: string } = req.body;

            try {
                this.handleRejectRequest(gameId, playerId, opponentName);

                res.status(StatusCodes.NO_CONTENT).send();
            } catch (exception) {
                next(exception);
            }
        });

        router.post('/:gameId/players/:playerId/start', (req: GameRequest, res: Response, next) => {
            const { gameId, playerId } = req.params;

            try {
                this.handleStartRequest(gameId, playerId);

                res.status(StatusCodes.NO_CONTENT).send();
            } catch (exception) {
                next(exception);
            }
        });

        router.delete('/:gameId/players/:playerId/cancel', (req: GameRequest, res: Response, next) => {
            const { gameId, playerId } = req.params;

            try {
                this.handleCancelGame(gameId, playerId);

                res.status(StatusCodes.NO_CONTENT).send();
            } catch (exception) {
                next(exception);
            }
        });

        router.delete('/:gameId/players/:playerId/leave', (req: GameRequest, res: Response, next) => {
            const { gameId, playerId } = req.params;

            try {
                this.handleLeave(gameId, playerId);

                res.status(StatusCodes.NO_CONTENT).send();
            } catch (exception) {
                next(exception);
            }
        });

        router.post('/:gameId/players/:playerId/reconnect', (req: GameRequest, res: Response, next) => {
            const { gameId, playerId } = req.params;
            const { newPlayerId }: { newPlayerId: string } = req.body;

            try {
                this.handleReconnection(gameId, playerId, newPlayerId);

                res.status(StatusCodes.NO_CONTENT).send();
            } catch (exception) {
                next(exception);
            }
        });

        router.delete('/:gameId/players/:playerId/disconnect', (req: GameRequest, res: Response, next) => {
            const { gameId, playerId } = req.params;

            try {
                this.handleDisconnection(gameId, playerId);

                res.status(StatusCodes.NO_CONTENT).send();
            } catch (exception) {
                next(exception);
            }
        });
    }

    private handleCancelGame(gameId: string, playerId: string): void {
        const waitingRoom = this.gameDispatcherService.getMultiplayerGameFromId(gameId);
        this.socketService.emitToRoomNoSender(gameId, playerId, 'canceledGame', { name: waitingRoom.getConfig().player1.name });
        this.gameDispatcherService.cancelGame(gameId, playerId);

        this.handleLobbiesUpdate();
    }

    private handleLeave(gameId: string, playerId: string): void {
        if (this.gameDispatcherService.isGameInWaitingRooms(gameId)) {
            const players = this.gameDispatcherService.leaveLobbyRequest(gameId, playerId);
            const playersData: PlayerData[] = players.map((player: Player) => player.convertToPlayerData());
            // TODO: Check what is returned
            this.socketService.emitToRoom(gameId, 'joinerLeaveGame', playersData);
            this.handleLobbiesUpdate();
            return;
        }
        // Check if there is no player left --> cleanup server and client
        try {
            if (!this.socketService.doesRoomExist(gameId)) {
                this.activeGameService.removeGame(gameId, playerId);
                return;
            }

            this.socketService.removeFromRoom(playerId, gameId);
            this.socketService.emitToSocket(playerId, 'cleanup');
        } catch (exception) {
            // catch errors caused by inexistent socket after client closed application
        }
        const playerName = this.activeGameService.getGame(gameId, playerId).getPlayer(playerId).name;

        this.socketService.emitToRoom(gameId, 'newMessage', {
            content: `${playerName} ${PLAYER_LEFT_GAME(this.activeGameService.isGameOver(gameId, playerId))}`,
            senderId: 'system',
            gameId,
        });

        if (this.activeGameService.isGameOver(gameId, playerId)) return;

        this.activeGameService.playerLeftEvent.emit('playerLeft', gameId, playerId);
    }

    private handlePlayerLeftFeedback(gameId: string, endOfGameMessages: string[], updatedData: GameUpdateData): void {
        this.socketService.emitToRoom(gameId, 'gameUpdate', updatedData);
        this.socketService.emitToRoom(gameId, 'newMessage', {
            content: endOfGameMessages.join('<br>'),
            senderId: SYSTEM_ID,
            gameId,
        });
    }

    private async handleCreateGame(config: GameConfigData): Promise<LobbyData | void> {
        if (config.playerName === undefined) throw new HttpException(PLAYER_NAME_REQUIRED, StatusCodes.BAD_REQUEST);
        if (config.maxRoundTime === undefined) throw new HttpException(MAX_ROUND_TIME_REQUIRED, StatusCodes.BAD_REQUEST);
        if (config.dictionary === undefined) throw new HttpException(DICTIONARY_REQUIRED, StatusCodes.BAD_REQUEST);

        if (!validateName(config.playerName)) throw new HttpException(NAME_IS_INVALID, StatusCodes.BAD_REQUEST);

        return await this.handleCreateMultiplayerGame(config);
    }

    private async handleCreateMultiplayerGame(config: GameConfigData): Promise<LobbyData> {
        const lobbyData = await this.gameDispatcherService.createMultiplayerGame(config);
        this.handleLobbiesUpdate();
        return lobbyData;
    }

    private handleJoinGame(gameId: string, playerId: string, playerName: string): void {
        if (playerName === undefined) throw new HttpException(PLAYER_NAME_REQUIRED, StatusCodes.BAD_REQUEST);
        if (!validateName(playerName)) throw new HttpException(NAME_IS_INVALID, StatusCodes.BAD_REQUEST);
        const waitingRoom = this.gameDispatcherService.requestJoinGame(gameId, playerId, playerName);

        // TODO: Potentially emit to whole room
        // TODO: Potentially emit more info with user info such as avatar
        this.socketService.emitToSocket(waitingRoom.getConfig().player1.id, 'joinRequest', { name: playerName });

        this.socketService.getSocket(playerId).leave(this.gameDispatcherService.getLobbiesRoom().getId());
        this.handleLobbiesUpdate();
    }

    private async handleAcceptRequest(gameId: string, playerId: string, playerName: string): Promise<void> {
        if (playerName === undefined) throw new HttpException(PLAYER_NAME_REQUIRED, StatusCodes.BAD_REQUEST);

        const [acceptedPlayer, players] = this.gameDispatcherService.handleJoinRequest(gameId, playerId, playerName, ACCEPT);
        const playersData: PlayerData[] = players.map((player: Player) => player.convertToPlayerData());

        this.socketService.addToRoom(acceptedPlayer.id, gameId);
        // TODO: Check what to return
        this.socketService.emitToRoom(gameId, 'player_joined', playersData);
    }

    private handleRejectRequest(gameId: string, playerId: string, playerName: string): void {
        if (playerName === undefined) throw new HttpException(PLAYER_NAME_REQUIRED, StatusCodes.BAD_REQUEST);
        const [rejectedPlayer, players] = this.gameDispatcherService.handleJoinRequest(gameId, playerId, playerName, REJECT);
        // TODO: Check what to return
        this.socketService.emitToSocket(rejectedPlayer.id, 'rejected', { name: players[0].name });
    }

    private async handleStartRequest(gameId: string, playerId: string): Promise<void> {
        const gameConfig = this.gameDispatcherService.startRequest(gameId, playerId);
        const startGameData = await this.activeGameService.beginGame(gameId, gameConfig);

        this.socketService.emitToRoom(gameId, 'startGame', startGameData);

        if (isIdVirtualPlayer(startGameData.round.playerData.id)) {
            this.gameDispatcherService
                .getVirtualPlayerService()
                .triggerVirtualPlayerTurn(startGameData, this.activeGameService.getGame(gameId, startGameData.round.playerData.id));
        }
    }

    private handleLobbiesRequest(playerId: string): void {
        const waitingRooms = this.gameDispatcherService.getAvailableWaitingRooms();
        this.socketService.addToRoom(playerId, this.gameDispatcherService.getLobbiesRoom().getId());
        this.socketService.emitToSocket(playerId, 'lobbiesUpdate', waitingRooms);
    }

    private handleLobbiesUpdate(): void {
        const waitingRooms = this.gameDispatcherService.getAvailableWaitingRooms();
        this.socketService.emitToRoom(this.gameDispatcherService.getLobbiesRoom().getId(), 'lobbiesUpdate', waitingRooms);
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
