import { GameVisibility } from './game-visibility';
import { PublicUser } from './user';
import { VirtualPlayerLevel } from './virtual-player-level';


export interface Group {
    groupId: string;
    user1?: PublicUser;
    user2?: PublicUser;
    user3?: PublicUser;
    user4?: PublicUser;
    hostName: string;
    maxRoundTime: number;
    gameVisibility: GameVisibility;
    virtualPlayerLever: VirtualPlayerLevel;
}
