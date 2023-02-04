import { PublicUser } from "../user";

export interface ChatMessage {
    sender: PublicUser;
    content: string;
    date: Date;
}