import { PlayerData } from '@app/classes/communication/';
import { Tile } from '@app/classes/tile';
import { PublicUser } from '@common/models/user';
export default class Player {
    id: string;
    publicUser: PublicUser;
    score: number;
    private tiles: Tile[];

    constructor(id: string, publicUser: PublicUser, tiles: Tile[]) {
        this.id = id;
        this.publicUser = publicUser;
        this.score = 0;
        this.tiles = [...tiles];
    }

    getTiles(): Tile[] {
        return [...this.tiles];
    }

    updatePlayerData(playerData: PlayerData): void {
        this.id = playerData.newId ? playerData.newId : this.id;
        this.publicUser = playerData.publicUser ? playerData.publicUser : this.publicUser;
        this.score = playerData.score ? playerData.score : this.score;
        this.tiles = playerData.tiles ? [...playerData.tiles] : this.tiles;
    }
}
