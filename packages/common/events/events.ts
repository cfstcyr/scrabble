import { ChatClientEvents, ChatServerEvents } from "./chat.event";

interface ErrorEvents {
  'error': (errorMessage: string, code: number) => string;
}
export type ServerEvents = ErrorEvents & ChatServerEvents;
export type ClientEvents = ChatClientEvents;