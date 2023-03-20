/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable dot-notation */
import { expect } from 'chai';
import Dictionary from './dictionary';
import { CompleteDictionaryData } from '@app/classes/communication/dictionary-data';
import { LetterPosition } from '@app/classes/word-finding';

const TEST_WORDS = ['ab', 'abc', 'abcd', 'abcde', 'ad'];
const DICTIONARY_DATA: CompleteDictionaryData = {
    title: 'Test dictionary',
    description: 'Dictionary for testing',
    words: TEST_WORDS,
    isDefault: false,
    id: 'id',
};

describe('DictionaryNode', () => {
    let dictionary: Dictionary;

    beforeEach(() => {
        dictionary = new Dictionary(DICTIONARY_DATA);
    });

    describe('constructor', () => {
        it('should contain all words', () => {
            for (const word of TEST_WORDS) {
                expect(dictionary.wordExists(word)).to.be.true;
            }
        });

        it('should not contain other words', () => {
            for (const word of TEST_WORDS) {
                expect(dictionary.wordExists(word + '-')).to.be.false;
            }
        });
    });

    describe('getRandomWord', () => {
        it('should return random words', () => {
            const firstWord = dictionary.getRandomWord();

            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            for (let i = 0; i < 100; ++i) {
                if (dictionary.getRandomWord() !== firstWord) {
                    expect(true).to.be.true;
                    return;
                }
            }

            expect(false).to.be.true;
        });

        it('should return word with max length', () => {
            const maxLength = 3;

            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            for (let i = 0; i < 1000; ++i) {
                expect(dictionary.getRandomWord({ maxLength }).length).to.be.lessThanOrEqual(maxLength);
            }
        });

        it('should return word with min length', () => {
            const minLength = 3;

            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            for (let i = 0; i < 100; ++i) {
                expect(dictionary.getRandomWord({ minLength }).length).to.be.greaterThanOrEqual(minLength);
            }
        });

        it('should return word with fixed letter', () => {
            const fixedLetters: LetterPosition[] = [{ letter: 'D', distance: 1 }];

            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            for (let i = 0; i < 100; ++i) {
                expect(dictionary.getRandomWord({ fixedLetters }).charAt(1)).to.be.equal('d');
            }
        });

        it('should throw if no words match criteria', () => {
            const fixedLetters: LetterPosition[] = [{ letter: 'Z', distance: 0 }];
            expect(() => dictionary.getRandomWord({ fixedLetters })).to.throw();
        });
    });
});
