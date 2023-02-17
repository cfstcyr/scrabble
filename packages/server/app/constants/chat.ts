import { ChannelCreation } from '@common/models/chat/channel';

export const GENERAL_CHANNEL: ChannelCreation = {
    name: 'general',
    canQuit: false,
    private: false,
    default: true,
};

export const DEFAULT_CHANNELS: ChannelCreation[] = [GENERAL_CHANNEL];
