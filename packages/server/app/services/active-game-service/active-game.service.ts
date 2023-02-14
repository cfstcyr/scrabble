import Game from '@app/classes/game/game';
import { ReadyGameConfig, StartGameData } from '@app/classes/game/game-config';
import { HttpException } from '@app/classes/http-exception/http-exception';
import { INVALID_PLAYER_ID_FOR_GAME, NO_GAME_FOUND_WITH_ID } from '@app/constants/services-errors';
import { Channel } from '@common/models/chat/channel';
import { TypeOfId } from '@common/types/id';
import { EventEmitter } from 'events';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';
import { ChatService } from '@app/services/chat-service/chat.service';
import { SocketService } from '@app/services/socket-service/socket.service';
import { PLAYER_LEFT_GAME } from '@app/constants/controllers-errors';
import { IS_REQUESTING } from '@app/constants/game-constants';

@Service()
export class ActiveGameService {
    playerLeftEvent: EventEmitter;
    private activeGames: Game[];

    constructor(private readonly socketService: SocketService, private readonly chatService: ChatService) {
        this.playerLeftEvent = new EventEmitter();
        this.activeGames = [];
        Game.injectServices();
    }

    async beginGame(id: string, groupChannelId: TypeOfId<Channel>, config: ReadyGameConfig): Promise<StartGameData> {
        const game = await Game.createGame(id, groupChannelId, config);
        this.activeGames.push(game);
        return game.createStartGameData();
    }

    getGame(id: string, playerId: string): Game {
        const filteredGames = this.activeGames.filter((g) => g.getId() === id);

        if (filteredGames.length === 0) throw new HttpException(NO_GAME_FOUND_WITH_ID, StatusCodes.NOT_FOUND);

        const game = filteredGames[0];
        if (game.player1.id === playerId || game.player2.id === playerId) return game;
        throw new HttpException(INVALID_PLAYER_ID_FOR_GAME, StatusCodes.NOT_FOUND);
    }

    removeGame(id: string, playerId: string): void {
        let game: Game;
        try {
            game = this.getGame(id, playerId);
        } catch (exception) {
            return;
        }

        const index = this.activeGames.indexOf(game);
        this.activeGames.splice(index, 1);
    }

    isGameOver(gameId: string, playerId: string): boolean {
        return this.getGame(gameId, playerId).gameIsOver;
    }

    handlePlayerLeaves(gameId: string, playerId: string): void {
        const game: Game = this.getGame(gameId, playerId);
        this.chatService.quitChannel(game.getGroupChannelId(), playerId);

        // Check if there is no player left --> cleanup server and client
        try {
            if (!this.socketService.doesRoomExist(gameId)) {
                this.removeGame(gameId, playerId);
                return;
            }

            this.socketService.removeFromRoom(playerId, gameId);
            this.socketService.emitToSocket(playerId, 'cleanup');
        } catch (exception) {
            // catch errors caused by inexistent socket after client closed application
        }
        const playerName = game.getPlayer(playerId, IS_REQUESTING).name;

        this.socketService.emitToRoom(gameId, 'newMessage', {
            content: `${playerName} ${PLAYER_LEFT_GAME(this.isGameOver(gameId, playerId))}`,
            senderId: 'system',
            gameId,
        });

        if (this.isGameOver(gameId, playerId)) return;

        this.playerLeftEvent.emit('playerLeft', gameId, playerId);
    }
}
