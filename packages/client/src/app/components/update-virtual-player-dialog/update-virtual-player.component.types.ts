import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';

export interface UpdateVirtualPlayerDialogParameters {
    name: string;
    level: VirtualPlayerLevel;
    id: string;
}

export enum UpdateDictionaryComponentIcons {
    SuccessIcon = 'check',
    ErrorIcon = 'times',
    NoIcon = '',
}
