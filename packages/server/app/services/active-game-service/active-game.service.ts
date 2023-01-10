import Game from '@app/classes/game/game';
import { ReadyGameConfig, StartGameData } from '@app/classes/game/game-config';
import { HttpException } from '@app/classes/http-exception/http-exception';
import { INVALID_PLAYER_ID_FOR_GAME, NO_GAME_FOUND_WITH_ID } from '@app/constants/services-errors';
import { EventEmitter } from 'events';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class ActiveGameService {
    playerLeftEvent: EventEmitter;
    private activeGames: Game[];

    constructor() {
        this.playerLeftEvent = new EventEmitter();
        this.activeGames = [];
        Game.injectServices();
    }

    async beginGame(id: string, config: ReadyGameConfig): Promise<StartGameData> {
        const game = await Game.createGame(id, config);
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
}
