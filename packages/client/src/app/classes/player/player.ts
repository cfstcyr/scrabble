import { PlayerData } from '@app/classes/communication/';
import { Tile } from '@app/classes/tile';
export default class Player {
    id: string;
    name: string;
    score: number;
    private tiles: Tile[];

    constructor(id: string, name: string, tiles: Tile[]) {
        this.id = id;
        this.name = name;
        this.score = 0;
        this.tiles = [...tiles];
    }

    getTiles(): Tile[] {
        return [...this.tiles];
    }

    updatePlayerData(playerData: PlayerData): void {
        this.id = playerData.newId ? playerData.newId : this.id;
        this.name = playerData.name ? playerData.name : this.name;
        this.score = playerData.score ? playerData.score : this.score;
        this.tiles = playerData.tiles ? [...playerData.tiles] : this.tiles;
    }
}
