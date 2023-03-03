import { Tile } from '@app/classes/tile';
import { PublicUser } from '@common/models/user';

export interface PlayerData {
    id: string;
    newId?: string;
    publicUser?: PublicUser;
    score?: number;
    tiles?: Tile[];
    isConnected?: boolean;
}
