/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Board } from '@app/classes/board';
import { Square } from '@app/classes/square';
import { BOARD_SIZE } from '@app/constants/game-constants';

const padStart = (str: string, size: number, pad = ' '): string => {
    let start = '';

    for (let i = 0; i < size - str.length; ++i) {
        start += pad;
    }
    return start + str;
};

export const logBoard = (board: Board | Square[][]): void => {
    const grid = board instanceof Board ? board.grid : board;

    const color = (str: string, n: number): string => `\x1b[${n}m${str}\x1b[0m`;

    const getColor = (r: number, c: number): number => {
        if (r % 2 === 0 && c % 2 === 0) return 40;
        else if (r % 2 === 0) return 41;
        else if (c % 2 === 0) return 42;
        else return 43;
    };

    console.log(
        '   ' +
            new Array(BOARD_SIZE.x)
                .fill(0)
                .map((_, i) => color(padStart(`${i + 1}`, 2), i % 2 === 0 ? 1 : 2))
                .join(''),
    );
    console.log(
        grid
            .map((line, r) => padStart(`${r + 1}`, 2) + ' ' + line.map((s, c) => color(padStart(s.tile?.letter ?? '', 2), getColor(r, c))).join(''))
            .join('\n'),
    );
};
