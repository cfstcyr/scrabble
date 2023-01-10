import { AbstractObjective } from '@app/classes/objectives/abstract-objective/abstract-objective';
import { Tile } from '@app/classes/tile';

export interface PlayerData {
    id: string;
    newId?: string;
    name?: string;
    score?: number;
    tiles?: Tile[];
    isConnected?: boolean;
    objectives?: AbstractObjective[];
}
