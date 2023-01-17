import { NoId } from './schema';

export interface VirtualPlayer {
    idVirtualPlayer: number;
    name: string;
    level: string;
    isDefault: boolean;
}

export interface VirtualPlayerProfilesData {
    virtualPlayerProfiles: NoId<VirtualPlayer>[];
}
