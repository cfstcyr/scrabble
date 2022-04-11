// Lint dot-notation must be disabled to access private element
/* eslint-disable dot-notation */
// Lint no unused expression must be disabled to use chai syntax
/* eslint-disable @typescript-eslint/no-unused-expressions, no-unused-expressions */
import { INVALID_WORD, WORD_CONTAINS_APOSTROPHE, WORD_CONTAINS_ASTERISK, WORD_CONTAINS_HYPHEN, WORD_TOO_SHORT } from '@app/constants/services-errors';
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import { WordsVerificationService } from './words-verification.service';
import { Container } from 'typedi';
import { ServicesTestingUnit } from '@app/services/services-testing-unit';

chai.use(spies);
chai.use(chaiAsPromised);

describe('WordsVerificationService', () => {
    let service: WordsVerificationService;
    let dictionaryTitle: string;
    let testingUnit: ServicesTestingUnit;

    beforeEach(() => {
        testingUnit = new ServicesTestingUnit().withStubbedDictionaryService();
    });

    beforeEach(() => {
        service = Container.get(WordsVerificationService);
    });

    afterEach(() => {
        testingUnit.restore();
    });

    it('should create', () => {
        expect(service).to.exist;
    });

    describe('removeAccents', () => {
        it('should remove all accents', () => {
            expect(service['removeAccents']('ŠšŽžÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝàáâãäåçèéêëìiíiîiïiñòóôõöùúûýÿ')).to.equal(
                'SsZzAAAAAACEEEEIIIINOOOOOUUUUYaaaaaaceeeeiiiiiiiinooooouuuyy',
            );
        });
    });

    describe('verifyWords', () => {
        it('should return error because word too short', () => {
            const testWord = 'a';
            const result = () => service.verifyWords([testWord], dictionaryTitle);
            expect(result).to.Throw(testWord + WORD_TOO_SHORT);
        });

        it('should return error because word contains asterisk', () => {
            const testWord = 'ka*ak';
            const result = () => service.verifyWords([testWord], dictionaryTitle);
            expect(result).to.Throw(testWord + WORD_CONTAINS_ASTERISK);
        });

        it('should return error because word contains hyphen', () => {
            const testWord = 'a-a';
            const result = () => service.verifyWords([testWord], dictionaryTitle);
            expect(result).to.Throw(testWord + WORD_CONTAINS_HYPHEN);
        });

        it('should return error because word contains apostrophe', () => {
            const testWord = "aaaa'aaaa";
            const result = () => service.verifyWords([testWord], dictionaryTitle);
            expect(result).to.Throw(testWord + WORD_CONTAINS_APOSTROPHE);
        });

        it('should return error if word is not in dictionary', () => {
            const testWord = 'ufdwihfewa';
            const result = () => service.verifyWords([testWord], dictionaryTitle);
            expect(result).to.Throw(INVALID_WORD(testWord.toUpperCase()));
        });

        it('should throw error if dictionary does not exist', () => {
            const testWord = 'ufdwihfewa';
            const result = () => service.verifyWords([testWord], 'truc');
            expect(result).to.Throw(INVALID_WORD(testWord.toUpperCase()));
        });
    });
});
