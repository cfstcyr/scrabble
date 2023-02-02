import { Channel } from '../models/chat/channel';
import { ChatMessage } from '../models/chat/chat-message';
import { NoId } from '../types/no-id';

export interface ChatServerEvents {
    'channel:newMessage': (message: ChatMessage) => void;
    'channel:newChannel': (response: string) => void;
    'channel:join': (response: string) => void;
    'channel:quit': (response: string) => void;
  }
  
  export interface ChatClientEvents {
    'channel:newMessage': (channel: NoId<Channel>, message: ChatMessage) => void;
    'channel:newChannel': (channel: NoId<Channel>) => void;
    'channel:join': (channel: Channel) => void;
    'channel:quit': (channel: Channel) => void;
  }

