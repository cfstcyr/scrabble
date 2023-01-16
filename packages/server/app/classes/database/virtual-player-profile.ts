import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
import { NoId } from '@app/schemas/schema';
import { VirtualPlayer } from '@app/schemas/virtual-player';

export interface VirtualPlayerProfile {
    name: string;
    level: VirtualPlayerLevel;
    id: string;
    isDefault: boolean;
}

export interface VirtualPlayerData {
    name: string;
    level: VirtualPlayerLevel;
}

export interface VirtualPlayerProfilesData {
    virtualPlayerProfiles: NoId<VirtualPlayer>[];
}
