/* eslint-disable dot-notation */
// Lint no unused expression must be disabled to use chai syntax
/* eslint-disable @typescript-eslint/no-unused-expressions, no-unused-expressions */
import { Square } from '@app/classes/square';
import { Tile } from '@app/classes/tile';
import * as chai from 'chai';
import { expect } from 'chai';
import * as spies from 'chai-spies';
import { StringConversion } from './string-conversion';
chai.use(spies);

describe('StringConversion', () => {
    afterEach(() => {
        chai.spy.restore();
    });

    describe('wordsToString', () => {
        it('should return the word', () => {
            const tiles: [Square, Tile][][] = [
                [
                    [{} as unknown as Square, { letter: 'A', value: 0 }],
                    [{} as unknown as Square, { letter: 'C', value: 0 }],
                ],
            ];
            const conversionSpy = chai.spy.on(StringConversion, 'tileToString', (tile: Tile) => tile.letter);
            expect(StringConversion.wordsToString(tiles)).to.deep.equal(['AC']);
            expect(conversionSpy).to.have.been.called.twice;
        });
    });

    describe('tileToString', () => {
        it('should return playedLetter if defined', () => {
            const tile: Tile = { letter: '*', value: 0, playedLetter: 'B' };
            expect(StringConversion['tileToString'](tile)).to.deep.equal('B');
        });

        it('should return letter if playedLetter is not defined', () => {
            const tile: Tile = { letter: 'A', value: 0 };
            expect(StringConversion['tileToString'](tile)).to.deep.equal('A');
        });
    });
});
