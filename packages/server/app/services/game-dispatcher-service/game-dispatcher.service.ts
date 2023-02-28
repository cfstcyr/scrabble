import { ReadyGameConfig, ReadyGameConfigWithChannelId } from '@app/classes/game/game-config';
import Room from '@app/classes/game/room';
import WaitingRoom from '@app/classes/game/waiting-room';
import { HttpException } from '@app/classes/http-exception/http-exception';
import Player from '@app/classes/player/player';
import { ExpertVirtualPlayer } from '@app/classes/virtual-player/expert-virtual-player/expert-virtual-player';
import {
    CANT_START_GAME_WITH_NO_REAL_OPPONENT,
    INVALID_PLAYER_ID_FOR_GAME,
    NO_DICTIONARY_INITIALIZED,
    NO_GAME_FOUND_WITH_ID,
    NO_USER_FOUND_WITH_NAME,
} from '@app/constants/services-errors';
import { CreateGameService } from '@app/services/create-game-service/create-game.service';
import DictionaryService from '@app/services/dictionary-service/dictionary.service';
import { SocketService } from '@app/services/socket-service/socket.service';
import { VirtualPlayerService } from '@app/services/virtual-player-service/virtual-player.service';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';
import { ChatService } from '@app/services/chat-service/chat.service';
import { UserId } from '@app/classes/user/connected-user-types';
import { Group, GroupData } from '@common/models/group';
import { convertToGroup } from '@app/utils/convert-to-group/convert-to-group';
import { PublicUser } from '@common/models/user';
@Service()
export class GameDispatcherService {
    private waitingRooms: WaitingRoom[];
    private groupsRoom: Room;

    constructor(
        private socketService: SocketService,
        private createGameService: CreateGameService,
        private dictionaryService: DictionaryService,
        private virtualPlayerService: VirtualPlayerService,
        private readonly chatService: ChatService,
    ) {
        this.waitingRooms = [];
        this.groupsRoom = new Room();
    }

    getGroupsRoom(): Room {
        return this.groupsRoom;
    }

    getVirtualPlayerService(): VirtualPlayerService {
        return this.virtualPlayerService;
    }

    async createMultiplayerGame(groupData: GroupData, userId: UserId, playerId: string): Promise<Group> {
        const waitingRoom = await this.createGameService.createMultiplayerGame(groupData, userId, playerId);
        const dictionaries = this.dictionaryService.getAllDictionarySummaries();
        if (dictionaries.length < 1) {
            throw new HttpException(NO_DICTIONARY_INITIALIZED, StatusCodes.INTERNAL_SERVER_ERROR);
        }
        waitingRoom.dictionarySummary = dictionaries[0];
        this.dictionaryService.useDictionary(waitingRoom.dictionarySummary.id);

        this.addToWaitingRoom(waitingRoom);
        this.socketService.addToRoom(playerId, waitingRoom.getId());
        return convertToGroup(waitingRoom.getConfig(), waitingRoom.getId());
    }

    requestJoinGame(waitingRoomId: string, playerId: string, publicUser: PublicUser): WaitingRoom {
        const waitingRoom = this.getMultiplayerGameFromId(waitingRoomId);

        // TODO: Currently games are acting as private where players need to be accepted
        waitingRoom.requestingPlayers.push(new Player(playerId, publicUser));
        return waitingRoom;
    }

    // TODO : Refactor to use player id instead of name
    async handleJoinRequest(waitingRoomId: string, playerId: string, requestingPlayerName: string, isAccepted: boolean): Promise<[Player, Group]> {
        const waitingRoom = this.getMultiplayerGameFromId(waitingRoomId);
        if (waitingRoom.getConfig().player1.id !== playerId) {
            throw new HttpException(INVALID_PLAYER_ID_FOR_GAME, StatusCodes.FORBIDDEN);
        }
        const requestingPlayers = waitingRoom.requestingPlayers.filter((player) => player.publicUser.username === requestingPlayerName);

        if (requestingPlayers.length === 0) throw new HttpException(NO_USER_FOUND_WITH_NAME, StatusCodes.NOT_FOUND);

        const requestingPlayer = requestingPlayers[0];
        if (isAccepted) {
            await this.chatService.joinChannel(waitingRoom.getGroupChannelId(), requestingPlayer.id);
            waitingRoom.fillNextEmptySpot(requestingPlayer);
        }
        const index = waitingRoom.requestingPlayers.indexOf(requestingPlayer);
        waitingRoom.requestingPlayers.splice(index, 1);
        return [requestingPlayer, waitingRoom.convertToGroup()];
    }

    startRequest(waitingRoomId: string, playerId: string): ReadyGameConfigWithChannelId {
        const waitingRoom = this.getMultiplayerGameFromId(waitingRoomId);
        if (waitingRoom.getConfig().player1.id !== playerId) {
            throw new HttpException(INVALID_PLAYER_ID_FOR_GAME, StatusCodes.FORBIDDEN);
        }
        if (waitingRoom.joinedPlayer2 === undefined && waitingRoom.joinedPlayer3 === undefined && waitingRoom.joinedPlayer4 === undefined) {
            throw new HttpException(CANT_START_GAME_WITH_NO_REAL_OPPONENT, StatusCodes.FORBIDDEN);
        }

        const index = this.waitingRooms.indexOf(waitingRoom);
        this.waitingRooms.splice(index, 1);

        const player2 = waitingRoom.joinedPlayer2
            ? waitingRoom.joinedPlayer2
            : new ExpertVirtualPlayer(waitingRoomId, this.virtualPlayerService.getRandomVirtualPlayerName(waitingRoom.getPlayers()));
        const player3 = waitingRoom.joinedPlayer3
            ? waitingRoom.joinedPlayer3
            : new ExpertVirtualPlayer(waitingRoomId, this.virtualPlayerService.getRandomVirtualPlayerName([...waitingRoom.getPlayers(), player2]));
        const player4 = waitingRoom.joinedPlayer4
            ? waitingRoom.joinedPlayer4
            : new ExpertVirtualPlayer(
                  waitingRoomId,
                  this.virtualPlayerService.getRandomVirtualPlayerName([...waitingRoom.getPlayers(), player2, player3]),
              );
        const config: ReadyGameConfig = {
            ...waitingRoom.getConfig(),
            player2,
            player3,
            player4,
            dictionarySummary: waitingRoom.dictionarySummary,
        };

        return { ...config, idChannel: waitingRoom.getGroupChannelId() };
    }

    isPlayerFromAcceptedPlayers(waitingRoomId: string, playerId: string): boolean {
        const waitingRoom = this.getMultiplayerGameFromId(waitingRoomId);
        return playerId === waitingRoom.joinedPlayer2?.id || playerId === waitingRoom.joinedPlayer3?.id || playerId === waitingRoom.joinedPlayer4?.id;
    }

    async leaveGroupRequest(waitingRoomId: string, playerId: string): Promise<Group> {
        const waitingRoom = this.getMultiplayerGameFromId(waitingRoomId);
        switch (playerId) {
            case waitingRoom.joinedPlayer2?.id: {
                waitingRoom.joinedPlayer2 = undefined;

                break;
            }
            case waitingRoom.joinedPlayer3?.id: {
                waitingRoom.joinedPlayer3 = undefined;

                break;
            }
            case waitingRoom.joinedPlayer4?.id: {
                waitingRoom.joinedPlayer4 = undefined;
                break;
            }
            default: {
                throw new HttpException(INVALID_PLAYER_ID_FOR_GAME, StatusCodes.FORBIDDEN);
            }
        }

        await this.chatService.quitChannel(waitingRoom.getGroupChannelId(), playerId);
        return waitingRoom.convertToGroup();
    }

    removeRequestingPlayer(waitingRoomId: string, playerId: string): PublicUser[] {
        const waitingRoom = this.getMultiplayerGameFromId(waitingRoomId);
        const requestingPlayers = waitingRoom.requestingPlayers.filter((player) => player.id === playerId);
        if (requestingPlayers.length === 0) throw new HttpException(INVALID_PLAYER_ID_FOR_GAME, StatusCodes.FORBIDDEN);

        const requestingPlayer = requestingPlayers[0];
        const index = waitingRoom.requestingPlayers.indexOf(requestingPlayer);
        waitingRoom.requestingPlayers.splice(index, 1);

        return waitingRoom.requestingPlayers.map((player) => player.publicUser);
    }

    async cancelGame(waitingRoomId: string, playerId: string): Promise<void> {
        const waitingRoom = this.getMultiplayerGameFromId(waitingRoomId);

        if (waitingRoom.getConfig().player1.id !== playerId) {
            throw new HttpException(INVALID_PLAYER_ID_FOR_GAME, StatusCodes.FORBIDDEN);
        }
        this.dictionaryService.stopUsingDictionary(waitingRoom.dictionarySummary.id);
        await this.chatService.emptyChannel(waitingRoom.getGroupChannelId());

        const index = this.waitingRooms.indexOf(waitingRoom);
        this.waitingRooms.splice(index, 1);
    }

    getAvailableWaitingRooms(): Group[] {
        const waitingRooms = this.waitingRooms.filter(
            (group) => group.joinedPlayer2 === undefined || group.joinedPlayer3 === undefined || group.joinedPlayer4 === undefined,
        );
        const groups: Group[] = [];
        for (const room of waitingRooms) {
            groups.push(convertToGroup(room.getConfig(), room.getId()));
        }

        return groups;
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
