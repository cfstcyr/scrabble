import { LobbyData } from '@app/classes/communication/lobby-data';
import { GameConfigData, ReadyGameConfig } from '@app/classes/game/game-config';
import Room from '@app/classes/game/room';
import WaitingRoom from '@app/classes/game/waiting-room';
import { HttpException } from '@app/classes/http-exception/http-exception';
import Player from '@app/classes/player/player';
import { ExpertVirtualPlayer } from '@app/classes/virtual-player/expert-virtual-player/expert-virtual-player';
import {
    CANNOT_HAVE_SAME_NAME,
    CANT_START_GAME_WITH_NO_REAL_OPPONENT,
    INVALID_PLAYER_ID_FOR_GAME,
    NO_GAME_FOUND_WITH_ID,
    NO_USER_FOUND_WITH_NAME,
} from '@app/constants/services-errors';
// import { ActiveGameService } from '@app/services/active-game-service/active-game.service';
import { CreateGameService } from '@app/services/create-game-service/create-game.service';
import DictionaryService from '@app/services/dictionary-service/dictionary.service';
import { SocketService } from '@app/services/socket-service/socket.service';
import { VirtualPlayerService } from '@app/services/virtual-player-service/virtual-player.service';
import { convertToLobbyData } from '@app/utils/convert-to-lobby-data/convert-to-lobby-data';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class GameDispatcherService {
    private waitingRooms: WaitingRoom[];
    private lobbiesRoom: Room;

    constructor(
        private socketService: SocketService,
        private createGameService: CreateGameService,
        // private activeGameService: ActiveGameService,
        private dictionaryService: DictionaryService,
        private virtualPlayerService: VirtualPlayerService,
    ) {
        this.waitingRooms = [];
        this.lobbiesRoom = new Room();
    }

    getLobbiesRoom(): Room {
        return this.lobbiesRoom;
    }

    // TODO: Remove this. Currently a hack to debug 4player
    getVirtualPlayerService(): VirtualPlayerService {
        return this.virtualPlayerService;
    }

    async createMultiplayerGame(config: GameConfigData): Promise<LobbyData> {
        const waitingRoom = this.createGameService.createMultiplayerGame(config);
        this.dictionaryService.useDictionary(config.dictionary.id);

        this.addToWaitingRoom(waitingRoom);
        this.socketService.addToRoom(config.playerId, waitingRoom.getId());
        return convertToLobbyData(waitingRoom.getConfig(), waitingRoom.getId());
    }

    requestJoinGame(waitingRoomId: string, playerId: string, playerName: string): WaitingRoom {
        const waitingRoom = this.getMultiplayerGameFromId(waitingRoomId);

        if (waitingRoom.getConfig().player1.name === playerName) {
            throw new HttpException(CANNOT_HAVE_SAME_NAME, StatusCodes.FORBIDDEN);
        }
        // TODO: Currently games are acting as private where players need to be accepted
        waitingRoom.requestingPlayers.push(new Player(playerId, playerName));
        return waitingRoom;
    }

    // TODO : Refactor to use player id instead of name
    handleJoinRequest(waitingRoomId: string, playerId: string, requestingPlayerName: string, isAccepted: boolean): [Player, string] {
        const waitingRoom = this.getMultiplayerGameFromId(waitingRoomId);
        if (waitingRoom.getConfig().player1.id !== playerId) {
            throw new HttpException(INVALID_PLAYER_ID_FOR_GAME, StatusCodes.FORBIDDEN);
        }
        const requestingPlayers = waitingRoom.requestingPlayers.filter((player) => player.name === requestingPlayerName);

        if (requestingPlayers.length === 0) throw new HttpException(NO_USER_FOUND_WITH_NAME, StatusCodes.NOT_FOUND);

        const requestingPlayer = requestingPlayers[0];
        if (isAccepted) waitingRoom.fillNextEmptySpot(requestingPlayer);
        const index = waitingRoom.requestingPlayers.indexOf(requestingPlayer);
        waitingRoom.requestingPlayers.splice(index, 1);
        return [requestingPlayer, waitingRoom.getConfig().player1.name];
    }

    startRequest(waitingRoomId: string, playerId: string): ReadyGameConfig {
        const waitingRoom = this.getMultiplayerGameFromId(waitingRoomId);
        if (waitingRoom.getConfig().player1.id !== playerId) {
            throw new HttpException(INVALID_PLAYER_ID_FOR_GAME, StatusCodes.FORBIDDEN);
        }
        if (waitingRoom.joinedPlayer2 === undefined && waitingRoom.joinedPlayer3 === undefined && waitingRoom.joinedPlayer4 === undefined) {
            throw new HttpException(CANT_START_GAME_WITH_NO_REAL_OPPONENT, StatusCodes.FORBIDDEN);
        }

        const index = this.waitingRooms.indexOf(waitingRoom);
        this.waitingRooms.splice(index, 1);

        // TODO: See how we want to handle the names
        const config: ReadyGameConfig = {
            ...waitingRoom.getConfig(),
            player2: waitingRoom.joinedPlayer2 ? waitingRoom.joinedPlayer2 : new ExpertVirtualPlayer(waitingRoomId, 'VirtualPlayer2'),
            player3: waitingRoom.joinedPlayer3 ? waitingRoom.joinedPlayer3 : new ExpertVirtualPlayer(waitingRoomId, 'VirtualPlayer3'),
            player4: waitingRoom.joinedPlayer4 ? waitingRoom.joinedPlayer4 : new ExpertVirtualPlayer(waitingRoomId, 'VirtualPlayer4'),
        };

        return config;
    }

    leaveLobbyRequest(waitingRoomId: string, playerId: string): string {
        const waitingRoom = this.getMultiplayerGameFromId(waitingRoomId);
        let leaverName;
        switch (playerId) {
            case waitingRoom.joinedPlayer2?.id: {
                leaverName = waitingRoom.joinedPlayer2?.name;
                waitingRoom.joinedPlayer2 = undefined;
                break;
            }
            case waitingRoom.joinedPlayer3?.id: {
                leaverName = waitingRoom.joinedPlayer2?.name;
                waitingRoom.joinedPlayer3 = undefined;
                break;
            }
            case waitingRoom.joinedPlayer4?.id: {
                leaverName = waitingRoom.joinedPlayer2?.name;
                waitingRoom.joinedPlayer4 = undefined;
                break;
            }
            default:
                throw new HttpException(INVALID_PLAYER_ID_FOR_GAME, StatusCodes.FORBIDDEN);
        }

        return leaverName as string;
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
        const waitingRooms = this.waitingRooms.filter(
            (lobby) => lobby.joinedPlayer2 === undefined || lobby.joinedPlayer3 === undefined || lobby.joinedPlayer4 === undefined,
        );
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
