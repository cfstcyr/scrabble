import { DEFAULT_TIMER_VALUE } from '@app/constants/pages-constants';
import { settings } from './settings';
import { num, str } from './validators';

export const authenticationSettings = settings('authentication', {
    token: str(),
});

export const gameSettings = settings('game', {
    playerName: str({ default: '' }),
    dictionaryName: str(),
    timer: num({ default: DEFAULT_TIMER_VALUE }),
});
