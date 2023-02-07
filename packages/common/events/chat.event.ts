import { Channel } from '../models/chat/channel';
import { ChannelMessage } from '../models/chat/chat-message';

export interface ChatServerEvents {
    'channel:newMessage': (message: ChannelMessage) => void;
    'channel:newChannel': (response: Channel) => void;
    'channel:join': (channel: Channel) => void;
    'channel:quit': (channel: Channel) => void;
  }
  
  export interface ChatClientEvents {
    'channel:newMessage': (message: ChannelMessage) => void;
    'channel:newChannel': (channelName: string) => void;
    'channel:join': (channel: string) => void;
    'channel:quit': (channel: string) => void;
    'channel:init': () => void;
  }

