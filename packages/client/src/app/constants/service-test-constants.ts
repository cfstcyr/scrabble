import { VirtualPlayerProfile } from '@app/classes/admin/virtual-player-profile';
import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';

export const MOCK_PLAYER_PROFILES: VirtualPlayerProfile[] = [
    {
        name: 'Jean Charest',
        id: 'lemouton',
        level: VirtualPlayerLevel.Beginner,
        isDefault: false,
    },
    {
        name: 'Jean Charest Jr',
        id: 'lemoutonnoir',
        level: VirtualPlayerLevel.Beginner,
        isDefault: false,
    },
    {
        name: 'Thomas "The best" Trépanier',
        id: 'lachevre',
        level: VirtualPlayerLevel.Expert,
        isDefault: false,
    },
];

export const MOCK_PLAYER_PROFILE_MAP: Map<VirtualPlayerLevel, string[]> = new Map([
    [VirtualPlayerLevel.Beginner, [MOCK_PLAYER_PROFILES[0].name, MOCK_PLAYER_PROFILES[1].name]],
    [VirtualPlayerLevel.Expert, [MOCK_PLAYER_PROFILES[2].name]],
]);
