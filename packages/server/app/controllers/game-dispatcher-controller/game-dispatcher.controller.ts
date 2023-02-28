import { GameUpdateData } from '@app/classes/communication/game-update-data';
import { LobbyData } from '@app/classes/communication/lobby-data';
import { PlayerData } from '@app/classes/communication/player-data';
import { CreateGameRequest, GameRequest, LobbiesRequest } from '@app/classes/communication/request';
import { GameConfigData, ReadyGameConfigWithChannelId } from '@app/classes/game/game-config';
import { GameMode } from '@app/classes/game/game-mode';
import { HttpException } from '@app/classes/http-exception/http-exception';
import { UserId } from '@app/classes/user/connected-user-types';
import { SECONDS_TO_MILLISECONDS, TIME_TO_RECONNECT } from '@app/constants/controllers-constants';
import {
    DICTIONARY_REQUIRED,
    GAME_IS_OVER,
    GAME_MODE_REQUIRED,
    GAME_TYPE_REQUIRED,
    MAX_ROUND_TIME_REQUIRED,
    NAME_IS_INVALID,
    PLAYER_NAME_REQUIRED,
    VIRTUAL_PLAYER_LEVEL_REQUIRED,
    VIRTUAL_PLAYER_NAME_REQUIRED,
} from '@app/constants/controllers-errors';
import { SYSTEM_ID } from '@app/constants/game-constants';
import { BaseController } from '@app/controllers/base-controller';
import { ActiveGameService } from '@app/services/active-game-service/active-game.service';
import { GameDispatcherService } from '@app/services/game-dispatcher-service/game-dispatcher.service';
import { SocketService } from '@app/services/socket-service/socket.service';
import { fillPlayerData } from '@app/utils/fill-player-data/fill-player-data';
import { isIdVirtualPlayer } from '@app/utils/is-id-virtual-player/is-id-virtual-player';
import { validateName } from '@app/utils/validate-name/validate-name';
import { Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';
import { BaseController } from '@app/controllers/base-controller';
import { isIdVirtualPlayer } from '@app/utils/is-id-virtual-player/is-id-virtual-player';
import { fillPlayerData } from '@app/utils/fill-player-data/fill-player-data';
import { UserId } from '@app/classes/user/connected-user-types';
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
            const userId: UserId = req.body.idUser;

            try {
                const lobbyData = await this.handleCreateGame({ playerId, ...body }, userId);
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

        router.delete('/:gameId/players/:playerId/cancel', async (req: GameRequest, res: Response, next) => {
            const { gameId, playerId } = req.params;

            try {
                await this.handleCancelGame(gameId, playerId);

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

    private async handleCancelGame(gameId: string, playerId: string): Promise<void> {
        const waitingRoom = this.gameDispatcherService.getMultiplayerGameFromId(gameId);
        this.socketService.emitToRoomNoSender(gameId, playerId, 'canceledGame', { name: waitingRoom.getConfig().player1.name });
        await this.gameDispatcherService.cancelGame(gameId, playerId);

        this.handleLobbiesUpdate();
    }

    private async handleLeave(gameId: string, playerId: string): Promise<void> {
        // TODO: Not only 1 socket probably
        if (this.gameDispatcherService.isGameInWaitingRooms(gameId)) {
            const result = await this.gameDispatcherService.leaveLobbyRequest(gameId, playerId);
            this.socketService.emitToSocket(result[0], 'joinerLeaveGame', { name: result[1] });
            this.handleLobbiesUpdate();
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

    private async handleCreateGame(config: GameConfigData, userId: UserId): Promise<LobbyData | void> {
        if (config.playerName === undefined) throw new HttpException(PLAYER_NAME_REQUIRED, StatusCodes.BAD_REQUEST);
        if (config.gameType === undefined) throw new HttpException(GAME_TYPE_REQUIRED, StatusCodes.BAD_REQUEST);
        if (config.gameMode === undefined) throw new HttpException(GAME_MODE_REQUIRED, StatusCodes.BAD_REQUEST);
        if (config.maxRoundTime === undefined) throw new HttpException(MAX_ROUND_TIME_REQUIRED, StatusCodes.BAD_REQUEST);
        if (config.dictionary === undefined) throw new HttpException(DICTIONARY_REQUIRED, StatusCodes.BAD_REQUEST);

        if (!validateName(config.playerName)) throw new HttpException(NAME_IS_INVALID, StatusCodes.BAD_REQUEST);

        return config.gameMode === GameMode.Multiplayer
            ? await this.handleCreateMultiplayerGame(config, userId)
            : await this.handleCreateSoloGame(config);
    }

    private async handleCreateMultiplayerGame(config: GameConfigData, userId: UserId): Promise<LobbyData> {
        const lobbyData = await this.gameDispatcherService.createMultiplayerGame(config, userId);
        this.handleLobbiesUpdate();
        return lobbyData;
    }

    private async handleCreateSoloGame(config: GameConfigData): Promise<void> {
        if (config.virtualPlayerName === undefined) throw new HttpException(VIRTUAL_PLAYER_NAME_REQUIRED, StatusCodes.BAD_REQUEST);
        if (config.virtualPlayerLevel === undefined) throw new HttpException(VIRTUAL_PLAYER_LEVEL_REQUIRED, StatusCodes.BAD_REQUEST);

        await this.gameDispatcherService.createSoloGame(config);
    }

    private handleJoinGame(gameId: string, playerId: string, playerName: string): void {
        if (playerName === undefined) throw new HttpException(PLAYER_NAME_REQUIRED, StatusCodes.BAD_REQUEST);
        if (!validateName(playerName)) throw new HttpException(NAME_IS_INVALID, StatusCodes.BAD_REQUEST);
        this.gameDispatcherService.requestJoinGame(gameId, playerId, playerName);
        this.socketService.emitToRoom(gameId, 'joinRequest', { name: playerName });

        this.socketService.getSocket(playerId).leave(this.gameDispatcherService.getLobbiesRoom().getId());
        this.handleLobbiesUpdate();
    }

    private async handleAcceptRequest(gameId: string, playerId: string, playerName: string): Promise<void> {
        if (playerName === undefined) throw new HttpException(PLAYER_NAME_REQUIRED, StatusCodes.BAD_REQUEST);
        // TODO: Dont start immediately
        const gameConfig: ReadyGameConfigWithChannelId = await this.gameDispatcherService.acceptJoinRequest(gameId, playerId, playerName);
        const startGameData = await this.activeGameService.beginGame(gameId, gameConfig.idChannel, gameConfig);

        // TODO: This is currently only working for 2 player
        this.socketService.addToRoom(startGameData.player2.id, gameId);
        this.socketService.emitToRoom(gameId, 'startGame', startGameData);

        // TODO Probably not supposed to go there
        if (isIdVirtualPlayer(startGameData.round.playerData.id)) {
            this.gameDispatcherService
                .getVirtualPlayerService()
                .triggerVirtualPlayerTurn(startGameData, this.activeGameService.getGame(gameId, startGameData.round.playerData.id));
        }
    }

    private handleRejectRequest(gameId: string, playerId: string, playerName: string): void {
        if (playerName === undefined) throw new HttpException(PLAYER_NAME_REQUIRED, StatusCodes.BAD_REQUEST);
        const [rejectedPlayer, hostName] = this.gameDispatcherService.rejectJoinRequest(gameId, playerId, playerName);
        this.socketService.emitToSocket(rejectedPlayer.id, 'rejected', { name: hostName });
        this.handleLobbiesUpdate();
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
