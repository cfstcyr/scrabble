/* eslint-disable @typescript-eslint/no-magic-numbers */
// import { logBoard } from '@app/utils/logger/logger';
import { appendFileSync } from 'fs';
import { PuzzleGenerator } from './puzzle-generator';

describe('PuzzleGenerator', () => {
    it('normal', () => {
        const COUNT = 5000;

        let count = 0;
        let total = 0;
        let values: number[] = [];

        for (let i = 0; i < COUNT; ++i) {
            const puzzleGenerator = new PuzzleGenerator();
            const start = Date.now();
            try {
                puzzleGenerator.generate();

                // if (end - start > 500) {
                //     console.log(end - start);
                //     logBoard(result.board);
                //     console.log(result.tiles);
                // }

                // logBoard(result.board);
                // console.log(result.tiles);
            } catch (e) {
                console.log(e);
                console.log('invalid');
            }

            const end = Date.now();
            total += end - start;
            values.push(end - start);
            count++;
            // console.log('====> ', end - start);
            // if (end - start > 200) console.log('=====================================================');
        }

        values = values.sort((a, b) => (a > b ? 1 : -1));

        // appendFileSync('./puzzle-benchmark.txt', values.join('\n'));

        console.log('total', total, '\navg.', total / count, '\nmax', values[count - 1], '\nmed', values[Math.floor(count / 2)], '\ncount', count);

        // const puzzleGenerator = new PuzzleGenerator();

        // const start = Date.now();

        // // for (let i = 0; i < COUNT; ++i) {
        // puzzleGenerator.generate();
        // // }

        // const end = Date.now();

        // console.log(end - start);
    });
});
