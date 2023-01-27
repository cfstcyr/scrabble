import { GameHistoryWithPlayers } from '@common/models/game-history';
import { NoId } from '@common/types/no-id';

export type DisplayGameHistoryKeys =
    | keyof Omit<NoId<GameHistoryWithPlayers>, 'playersData'>
    | 'player1Data'
    | 'player1Name'
    | 'player1Score'
    | 'player2Data'
    | 'player2Name'
    | 'player2Score'
    | 'startDate'
    | 'endDate'
    | 'duration';

export type DisplayGameHistoryColumns = {
    [Property in DisplayGameHistoryKeys]: string;
};

export type DisplayGameHistoryColumnsIteratorItem = { key: DisplayGameHistoryKeys; label: string };

export enum GameHistoryState {
    Ready = 'ready',
    Loading = 'loading',
    Error = 'error',
}
