import { VirtualPlayer } from '@common/models/virtual-player';

export type UpdateVirtualPlayerDialogParameters = Omit<VirtualPlayer, 'idDefault'>;

export enum UpdateDictionaryComponentIcons {
    SuccessIcon = 'check',
    ErrorIcon = 'times',
    NoIcon = '',
}
