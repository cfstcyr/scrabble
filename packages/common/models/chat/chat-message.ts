import { WithIdOf } from "../../types/id";
import { PublicUser } from "../user";
import { Channel } from "./channel";

export interface ChatMessage {
    sender: PublicUser;
    content: string;
    date: Date;
}

export interface ChannelMessage extends WithIdOf<Channel> {
    message: ChatMessage;
}
