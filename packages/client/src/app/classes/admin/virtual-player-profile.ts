import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';

export interface VirtualPlayerProfile {
    name: string;
    level: VirtualPlayerLevel;
    idVirtualPlayer: string;
    isDefault: boolean;
}

export interface VirtualPlayerData {
    name: string;
    level: VirtualPlayerLevel;
    idVirtualPlayer?: string;
}

export interface VirtualPlayerProfilesData {
    virtualPlayerProfiles: VirtualPlayerProfile[];
}
