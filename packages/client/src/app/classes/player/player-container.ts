import { PlayerData } from '@app/classes/communication';
import { PLAYER_1_INDEX } from '@app/constants/game-constants';
import { MISSING_PLAYER_DATA_TO_INITIALIZE, PLAYER_NUMBER_INVALID } from '@app/constants/services-errors';
import Player from './player';

export class PlayerContainer {
    private players: Map<number, Player>;
    private readonly localPlayerId: string;

    constructor(localPlayerId: string) {
        this.players = new Map();
        this.localPlayerId = localPlayerId;
    }

    getLocalPlayerId(): string {
        return this.localPlayerId;
    }

    getLocalPlayer(): Player | undefined {
        if (!this.getLocalPlayerId()) return undefined;
        const filteredPlayers = [...this.players.values()].filter((p) => p.id === this.getLocalPlayerId());

        return filteredPlayers[0] ? filteredPlayers[0] : undefined;
    }

    initializePlayers(playersData: PlayerData[]): this {
        this.resetPlayers();
        playersData.forEach((playerData: PlayerData, index: number) => this.initializePlayer(PLAYER_1_INDEX + index, playerData));
        return this;
    }

    initializePlayer(playerNumber: number, playerData: PlayerData): this {
        if (!playerData.publicUser || !playerData.tiles) throw new Error(MISSING_PLAYER_DATA_TO_INITIALIZE);
        this.setPlayer(playerNumber, new Player(playerData.id, playerData.publicUser, playerData.tiles));
        return this;
    }

    getPlayer(playerNumber: number): Player {
        const player: Player | undefined = this.players.get(playerNumber);
        if (!player) throw new Error(PLAYER_NUMBER_INVALID(playerNumber));
        return player;
    }

    updatePlayersData(...playersData: PlayerData[]): this {
        playersData.forEach((playerData: PlayerData) => {
            [...this.players.values()]
                .filter((player: Player) => player.id === playerData.id)
                .forEach((player: Player) => player.updatePlayerData(playerData));
        });
        return this;
    }

    private setPlayer(playerNumber: number, player: Player): this {
        this.players.set(playerNumber, player);
        return this;
    }

    private resetPlayers(): this {
        this.players.clear();
        return this;
    }
}
