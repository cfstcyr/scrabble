import { GameUpdateData } from '@app/classes/communication/game-update-data';
import { Message } from '@app/classes/communication/message';
import { StartGameData } from '@app/classes/game/game-config';
import { Group } from '@common/models/group';
import { HighScoreWithPlayers } from '@common/models/high-score';
import { PublicUser } from '@common/models/user';
import { NoId } from '@common/types/id';

export type SocketEmitEvents =
    | 'joinRequest'
    | 'joinRequestCancelled'
    | 'acceptJoinRequest'
    | 'rejectJoinRequest'
    | 'cancelledGroup'
    | 'userLeftGroup'
    | 'gameUpdate'
    | 'startGame'
    | 'groupsUpdate'
    | 'highScoresList'
    | 'newMessage'
    | 'cleanup'
    | '_test_event';

export type JoinRequestEmitArgs = PublicUser[];
export type JoinRequestCancelledEmitArgs = PublicUser[];
export type AcceptJoinRequestEmitArgs = Group;
export type RejectJoinRequestEmitArgs = PublicUser;
export type CancelledGroupEmitArgs = PublicUser;
export type UserLeftGroupEmitArgs = Group;
export type GameUpdateEmitArgs = GameUpdateData;
export type StartGameEmitArgs = StartGameData;
export type GroupsUpdateEmitArgs = Group[];
export type HighScoresEmitArgs = NoId<HighScoreWithPlayers>[];
export type NewMessageEmitArgs = Message;
export type CleanupEmitArgs = never;
