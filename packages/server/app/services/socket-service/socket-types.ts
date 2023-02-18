import { GameUpdateData } from '@app/classes/communication/game-update-data';
import { LobbyData } from '@app/classes/communication/lobby-data';
import { Message } from '@app/classes/communication/message';
import { PlayerData } from '@app/classes/communication/player-data';
import { PlayerName } from '@app/classes/communication/player-name';
import { StartGameData } from '@app/classes/game/game-config';
import { NoIdGameHistoryWithPlayers } from '@common/models/game-history';
import { HighScoreWithPlayers } from '@common/models/high-score';
import { NoId } from '@common/types/id';

export type SocketEmitEvents =
    | 'gameUpdate'
    | 'joinRequest'
    | 'player_joined'
    | 'startGame'
    | 'rejected'
    | 'lobbiesUpdate'
    | 'canceledGame'
    | 'joinerLeaveGame'
    | 'playerLeft'
    | 'highScoresList'
    | 'newMessage'
    | 'cleanup'
    | '_test_event';

export type GameUpdateEmitArgs = GameUpdateData;
export type JoinRequestEmitArgs = PlayerName;
export type PlayerJoinedEmitArgs = PlayerData;
export type StartGameEmitArgs = StartGameData;
export type RejectEmitArgs = PlayerName;
export type CanceledGameEmitArgs = PlayerName;
export type JoinerLeaveGameEmitArgs = PlayerName;
export type PlayerLeftGameEmitArgs = PlayerName;
export type LobbiesUpdateEmitArgs = LobbyData[];
export type HighScoresEmitArgs = NoId<HighScoreWithPlayers>[];
export type GameHistoriesEmitArgs = NoIdGameHistoryWithPlayers[];
export type NewMessageEmitArgs = Message;
export type CleanupEmitArgs = never;
