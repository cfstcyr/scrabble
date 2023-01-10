import { LobbyData } from '@app/classes/communication/lobby-data';
import { GameConfig, GameConfigData, ReadyGameConfig } from '@app/classes/game/game-config';
import Room from '@app/classes/game/room';
import WaitingRoom from '@app/classes/game/waiting-room';
import { HttpException } from '@app/classes/http-exception/http-exception';
import Player from '@app/classes/player/player';
import { GOOD_LUCK_MESSAGE } from '@app/constants/game-constants';
import {
    CANNOT_HAVE_SAME_NAME,
    INVALID_PLAYER_ID_FOR_GAME,
    NO_GAME_FOUND_WITH_ID,
    NO_OPPONENT_IN_WAITING_GAME,
    OPPONENT_NAME_DOES_NOT_MATCH,
    PLAYER_ALREADY_TRYING_TO_JOIN,
} from '@app/constants/services-errors';
import { ActiveGameService } from '@app/services/active-game-service/active-game.service';
import { CreateGameService } from '@app/services/create-game-service/create-game.service';
import DictionaryService from '@app/services/dictionary-service/dictionary.service';
import { SocketService } from '@app/services/socket-service/socket.service';
import { VirtualPlayerService } from '@app/services/virtual-player-service/virtual-player.service';
import { convertToLobbyData } from '@app/utils/convert-to-lobby-data/convert-to-lobby-data';
import { isIdVirtualPlayer } from '@app/utils/is-id-virtual-player/is-id-virtual-player';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class GameDispatcherService {
    private waitingRooms: WaitingRoom[];
    private lobbiesRoom: Room;

    constructor(
        private socketService: SocketService,
        private createGameService: CreateGameService,
        private activeGameService: ActiveGameService,
        private dictionaryService: DictionaryService,
        private virtualPlayerService: VirtualPlayerService,
    ) {
        this.waitingRooms = [];
        this.lobbiesRoom = new Room();
    }

    getLobbiesRoom(): Room {
        return this.lobbiesRoom;
    }

    async createSoloGame(config: GameConfigData): Promise<void> {
        const startGameData = await this.createGameService.createSoloGame(config);
        this.dictionaryService.useDictionary(config.dictionary.id);

        const gameId = startGameData.gameId;
        this.socketService.addToRoom(config.playerId, gameId);

        this.socketService.emitToSocket(config.playerId, 'startGame', startGameData);

        if (isIdVirtualPlayer(startGameData.round.playerData.id)) {
            this.virtualPlayerService.triggerVirtualPlayerTurn(
                startGameData,
                this.activeGameService.getGame(gameId, startGameData.round.playerData.id),
            );
        }

        this.socketService.emitToRoom(gameId, 'newMessage', {
            content: GOOD_LUCK_MESSAGE,
            senderId: startGameData.player2.id,
            gameId,
        });
    }

    async createMultiplayerGame(config: GameConfigData): Promise<LobbyData> {
        const waitingRoom = this.createGameService.createMultiplayerGame(config);
        this.dictionaryService.useDictionary(config.dictionary.id);

        this.addToWaitingRoom(waitingRoom);
        this.socketService.addToRoom(config.playerId, waitingRoom.getId());
        return convertToLobbyData(waitingRoom.getConfig(), waitingRoom.getId());
    }

    requestJoinGame(waitingRoomId: string, playerId: string, playerName: string): GameConfig {
        const waitingRoom = this.getMultiplayerGameFromId(waitingRoomId);
        if (waitingRoom.joinedPlayer !== undefined) {
            throw new HttpException(PLAYER_ALREADY_TRYING_TO_JOIN, StatusCodes.FORBIDDEN);
        }
        if (waitingRoom.getConfig().player1.name === playerName) {
            throw new HttpException(CANNOT_HAVE_SAME_NAME, StatusCodes.FORBIDDEN);
        }

        waitingRoom.joinedPlayer = new Player(playerId, playerName);
        return waitingRoom.getConfig();
    }

    acceptJoinRequest(waitingRoomId: string, playerId: string, opponentName: string): ReadyGameConfig {
        const waitingRoom = this.getMultiplayerGameFromId(waitingRoomId);
        if (waitingRoom.getConfig().player1.id !== playerId) {
            throw new HttpException(INVALID_PLAYER_ID_FOR_GAME, StatusCodes.FORBIDDEN);
        } else if (waitingRoom.joinedPlayer === undefined) {
            throw new HttpException(NO_OPPONENT_IN_WAITING_GAME, StatusCodes.BAD_REQUEST);
        } else if (waitingRoom.joinedPlayer.name !== opponentName) {
            throw new HttpException(OPPONENT_NAME_DOES_NOT_MATCH, StatusCodes.BAD_REQUEST);
        }

        const index = this.waitingRooms.indexOf(waitingRoom);
        this.waitingRooms.splice(index, 1);

        const config: ReadyGameConfig = {
            ...waitingRoom.getConfig(),
            player2: waitingRoom.joinedPlayer,
        };

        return config;
    }

    rejectJoinRequest(waitingRoomId: string, playerId: string, opponentName: string): [Player, string] {
        const waitingRoom = this.getMultiplayerGameFromId(waitingRoomId);

        if (waitingRoom.getConfig().player1.id !== playerId) {
            throw new HttpException(INVALID_PLAYER_ID_FOR_GAME, StatusCodes.FORBIDDEN);
        } else if (waitingRoom.joinedPlayer === undefined) {
            throw new HttpException(NO_OPPONENT_IN_WAITING_GAME, StatusCodes.BAD_REQUEST);
        } else if (waitingRoom.joinedPlayer.name !== opponentName) {
            throw new HttpException(OPPONENT_NAME_DOES_NOT_MATCH, StatusCodes.BAD_REQUEST);
        }

        const rejectedPlayer = waitingRoom.joinedPlayer;
        waitingRoom.joinedPlayer = undefined;
        return [rejectedPlayer, waitingRoom.getConfig().player1.name];
    }

    leaveLobbyRequest(waitingRoomId: string, playerId: string): [string, string] {
        const waitingRoom = this.getMultiplayerGameFromId(waitingRoomId);
        if (waitingRoom.joinedPlayer === undefined) {
            throw new HttpException(NO_OPPONENT_IN_WAITING_GAME, StatusCodes.BAD_REQUEST);
        } else if (waitingRoom.joinedPlayer.id !== playerId) {
            throw new HttpException(INVALID_PLAYER_ID_FOR_GAME, StatusCodes.FORBIDDEN);
        }
        const leaverName = waitingRoom.joinedPlayer.name;
        const hostPlayerId = waitingRoom.getConfig().player1.id;

        waitingRoom.joinedPlayer = undefined;
        return [hostPlayerId, leaverName];
    }

    cancelGame(waitingRoomId: string, playerId: string): void {
        const waitingRoom = this.getMultiplayerGameFromId(waitingRoomId);

        if (waitingRoom.getConfig().player1.id !== playerId) {
            throw new HttpException(INVALID_PLAYER_ID_FOR_GAME, StatusCodes.FORBIDDEN);
        }
        this.dictionaryService.stopUsingDictionary(waitingRoom.getConfig().dictionary.id);

        const index = this.waitingRooms.indexOf(waitingRoom);
        this.waitingRooms.splice(index, 1);
    }

    getAvailableWaitingRooms(): LobbyData[] {
        const waitingRooms = this.waitingRooms.filter((g) => g.joinedPlayer === undefined);
        const lobbyData: LobbyData[] = [];
        for (const room of waitingRooms) {
            lobbyData.push(convertToLobbyData(room.getConfig(), room.getId()));
        }

        return lobbyData;
    }

    getMultiplayerGameFromId(waitingRoomId: string): WaitingRoom {
        const filteredWaitingRoom = this.waitingRooms.filter((g) => g.getId() === waitingRoomId);
        if (filteredWaitingRoom.length > 0) return filteredWaitingRoom[0];
        throw new HttpException(NO_GAME_FOUND_WITH_ID, StatusCodes.NOT_FOUND);
    }

    isGameInWaitingRooms(gameId: string): boolean {
        const filteredWaitingRoom = this.waitingRooms.filter((g) => g.getId() === gameId);
        return filteredWaitingRoom.length > 0;
    }

    private addToWaitingRoom(waitingRoom: WaitingRoom): void {
        this.waitingRooms.push(waitingRoom);
    }
}
