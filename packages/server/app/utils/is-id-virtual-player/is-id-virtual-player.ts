import { VIRTUAL_PLAYER_ID_PREFIX } from '@app/constants/virtual-player-constants';

export const isIdVirtualPlayer = (id: string): boolean => {
    return id.includes(VIRTUAL_PLAYER_ID_PREFIX);
};
