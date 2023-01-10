import { GameUpdateData } from '@app/classes/communication/game-update-data';
import { LobbyData } from '@app/classes/communication/lobby-data';
import { Message } from '@app/classes/communication/message';
import { PlayerName } from '@app/classes/communication/player-name';
import { GameHistory } from '@app/classes/database/game-history';
import { HighScore } from '@app/classes/database/high-score';
import { StartGameData } from '@app/classes/game/game-config';

export type SocketEmitEvents =
    | 'gameUpdate'
    | 'joinRequest'
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
export type StartGameEmitArgs = StartGameData;
export type RejectEmitArgs = PlayerName;
export type CanceledGameEmitArgs = PlayerName;
export type JoinerLeaveGameEmitArgs = PlayerName;
export type PlayerLeftGameEmitArgs = PlayerName;
export type LobbiesUpdateEmitArgs = LobbyData[];
export type HighScoresEmitArgs = HighScore[];
export type GameHistoriesEmitArgs = GameHistory[];
export type NewMessageEmitArgs = Message;
export type CleanupEmitArgs = never;
