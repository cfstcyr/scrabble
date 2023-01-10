import { GameHistory } from '@app/classes/game-history/game-history';

export type DisplayGameHistoryKeys =
    | keyof GameHistory
    | 'player1Name'
    | 'player1Score'
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
