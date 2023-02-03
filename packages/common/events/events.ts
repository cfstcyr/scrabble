import { ChatClientEvents, ChatServerEvents } from "./chat.event";

interface ErrorEvents {
  'error': (errorMessage: string, code: number) => void;
}
export type ServerEvents = ErrorEvents & ChatServerEvents;
export type ClientEvents = ChatClientEvents;