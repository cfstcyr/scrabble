import { DEFAULT_TIMER_VALUE } from '@app/constants/pages-constants';
import { PublicUser } from '@common/models/user';
import { settings } from './settings';
import { json, num, str } from './validators';

export const authenticationSettings = settings('authentication', {
    token: str(),
    user: json<PublicUser>({ isRequired: true }),
});

export const gameSettings = settings('game', {
    playerName: str({ default: '' }),
    dictionaryName: str(),
    timer: num({ default: DEFAULT_TIMER_VALUE }),
});
