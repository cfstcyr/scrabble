/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
import { GameHistoriesData, GameHistoryData } from '@app/classes/communication/game-histories';
import { GameMode } from '@app/constants/game-mode';
import { GameType } from '@app/constants/game-type';
import { GameHistoriesConverter } from './game-histories-converter';
import { GameHistory } from './game-history';

const DEFAULT_GAME_HISTORY: GameHistory = {
    startTime: new Date(),
    endTime: new Date(),
    player1Data: { name: '1', score: 0, isVirtualPlayer: false, isWinner: false },
    player2Data: { name: '2', score: 0, isVirtualPlayer: false, isWinner: false },
    gameType: GameType.Classic,
    gameMode: GameMode.Solo,
    hasBeenAbandoned: false,
};
const DEFAULT_GAME_HISTORY_DATA: GameHistoryData = {
    ...DEFAULT_GAME_HISTORY,
    startTime: '',
    endTime: '',
};
const DEFAULT_GAME_HISTORIES_DATA: GameHistoriesData = {
    gameHistories: [{ ...DEFAULT_GAME_HISTORY_DATA, ...DEFAULT_GAME_HISTORY_DATA, ...DEFAULT_GAME_HISTORY_DATA }],
};

describe('GameHistoriesConverter', () => {
    describe('convert', () => {
        it('should call map with convertGameHistory', () => {
            const gameHistories = { ...DEFAULT_GAME_HISTORIES_DATA };
            const mapSpy = spyOn(gameHistories.gameHistories, 'map').and.returnValue([]);

            GameHistoriesConverter.convert(gameHistories);

            expect(mapSpy).toHaveBeenCalledOnceWith(GameHistoriesConverter['convertGameHistory']);
        });

        it('should call sort with compareGameHistory', () => {
            const gameHistories = { ...DEFAULT_GAME_HISTORIES_DATA };
            const mapResult = new Array<GameHistory>();
            spyOn(gameHistories.gameHistories, 'map').and.returnValue(mapResult);
            const sortSpy = spyOn(mapResult, 'sort');

            GameHistoriesConverter.convert(gameHistories);

            expect(sortSpy).toHaveBeenCalledOnceWith(GameHistoriesConverter['compareGameHistory']);
        });
    });

    describe('convertGameHistory', () => {
        it('should convert startTime and endTime in dates', () => {
            const gameHistory = { ...DEFAULT_GAME_HISTORY_DATA };

            const result = GameHistoriesConverter['convertGameHistory'](gameHistory);

            expect(result.startTime instanceof Date).toBeTrue();
            expect(result.endTime instanceof Date).toBeTrue();
        });
    });

    describe('compareGameHistory', () => {
        const tests: [timeA: Date, timeB: Date, expected: 1 | -1][] = [
            [new Date(1, 1, 1, 10, 30), new Date(1, 1, 1, 10, 40), 1],
            [new Date(1, 1, 1, 10, 50), new Date(1, 1, 1, 9, 40), -1],
        ];

        let index = 1;
        for (const [timeA, timeB, expected] of tests) {
            it(`should compare (${index})`, () => {
                const gameHistoryA = { ...DEFAULT_GAME_HISTORY, startTime: timeA };
                const gameHistoryB = { ...DEFAULT_GAME_HISTORY, startTime: timeB };
                expect(GameHistoriesConverter['compareGameHistory'](gameHistoryA, gameHistoryB)).toEqual(expected);
            });
            index++;
        }
    });
});
