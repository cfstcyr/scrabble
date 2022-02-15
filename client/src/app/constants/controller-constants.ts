import { Message } from '@app/classes/communication/message';
import { SYSTEM_ID } from './game';

export const INITIAL_MESSAGE: Message = {
    content: 'Début de la partie',
    senderId: SYSTEM_ID,
};

export const DEFAULT_OPPONENT_NAME = 'steve';
