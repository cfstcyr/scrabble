import { GameUpdateData } from '@app/classes/communication/game-update-data';
import { Message } from '@app/classes/communication/message';
import { StartGameData } from '@app/classes/game/game-config';
import { Group } from '@common/models/group';
import { RequestingUsers } from '@common/models/requesting-users';
import { HighScoreWithPlayers } from '@common/models/high-score';
import { PublicUser } from '@common/models/user';
import { NoId } from '@common/types/id';
import { Square } from '@app/classes/square';
import { Position } from '@app/classes/board';

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
    | 'firstSquareSelected'
    | 'firstSquareCancelled'
    | 'cleanup'
    | '_test_event';

export type JoinRequestEmitArgs = RequestingUsers;
export type JoinRequestCancelledEmitArgs = RequestingUsers;
export type AcceptJoinRequestEmitArgs = Group;
export type RejectJoinRequestEmitArgs = PublicUser;
export type CancelledGroupEmitArgs = PublicUser;
export type UserLeftGroupEmitArgs = Group;
export type GameUpdateEmitArgs = GameUpdateData;
export type StartGameEmitArgs = StartGameData;
export type GroupsUpdateEmitArgs = Group[];
export type HighScoresEmitArgs = NoId<HighScoreWithPlayers>[];
export type NewMessageEmitArgs = Message;
export type FirstSquareSelected = Position;
export type FirstSquareCancelled = Square;
export type CleanupEmitArgs = never;
