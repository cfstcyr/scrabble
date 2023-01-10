import { LobbyData } from './';

export default interface LobbyInfo extends LobbyData {
    canJoin?: boolean;
    meetFilters?: boolean;
}
