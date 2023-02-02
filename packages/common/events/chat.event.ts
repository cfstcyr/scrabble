import { Channel } from '../models/chat/channel';
import { ChatMessage } from '../models/chat/chat-message';
import { NoId } from '../types/no-id';

export interface ChatServerEvents {
    'channel:newMessage': (channelId: string, message: ChatMessage) => void;
    'channel:newChannel': (response: Channel) => void;
    'channel:join': (channel: Channel) => void;
    'channel:quit': (channel: Channel) => void;
  }
  
  export interface ChatClientEvents {
    'channel:newMessage': (channel: NoId<Channel>, message: ChatMessage) => void;
    'channel:newChannel': (channel: NoId<Channel>) => void;
    'channel:join': (channel: string) => void;
    'channel:quit': (channel: Channel) => void;
    'channel:init': () => void;
  }

