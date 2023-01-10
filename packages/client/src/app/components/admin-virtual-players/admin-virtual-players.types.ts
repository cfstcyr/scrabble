import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';

export type DisplayVirtualPlayersKeys = keyof { name: string } | 'name' | 'actions';

export type DisplayVirtualPlayersColumns = {
    [Property in DisplayVirtualPlayersKeys]: string;
};

export type DisplayVirtualPlayersColumnsIteratorItem = { key: DisplayVirtualPlayersKeys; label: string };

export enum VirtualPlayersComponentState {
    Ready = 'ready',
    Loading = 'loading',
    Error = 'error',
}

export interface UpdateVirtualPlayersDialogParameters {
    name: string;
    level: VirtualPlayerLevel;
    id: string;
}

export interface DeleteVirtualPlayerDialogParameters {
    name: string;
    level: VirtualPlayerLevel;
    id: string;
    onClose: () => void;
}
