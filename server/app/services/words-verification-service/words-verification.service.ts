import { DICTIONARY_NAME, DICTIONARY_RELATIVE_PATH } from '@app/constants/services-constants/words-verification.service.const';
import {
    INVALID_WORD,
    MINIMUM_WORD_LENGTH,
    WORD_CONTAINS_APOSTROPHE,
    WORD_CONTAINS_ASTERISK,
    WORD_CONTAINS_HYPHEN,
    WORD_TOO_SHORT,
} from '@app/constants/services-errors';
import * as fs from 'fs';
import { join } from 'path';
import { Service } from 'typedi';
import { DictionaryData } from './words-verification.service.types';

@Service()
export class WordsVerificationService {
    private activeDictionaries: Map<string, Set<string>>;

    constructor() {
        this.activeDictionaries = new Map<string, Set<string>>();
        this.loadAllDictionaries();
    }

    verifyWords(words: string[], dictionary: string): void {
        for (let word of words) {
            if (word.length <= 0) continue;
            word = this.removeAccents(word);
            word = word.toLowerCase();
            if (word.length < MINIMUM_WORD_LENGTH) throw new Error(word + WORD_TOO_SHORT);
            if (word.includes('*')) throw new Error(word + WORD_CONTAINS_ASTERISK);
            if (word.includes('-')) throw new Error(word + WORD_CONTAINS_HYPHEN);
            if (word.includes("'")) throw new Error(word + WORD_CONTAINS_APOSTROPHE);
            if (!this.activeDictionaries.get(dictionary)?.has(word)) throw new Error(INVALID_WORD(word.toUpperCase()));
        }
    }

    // TODO: Add to dictionnaryService
    // Will be removed during sprint 3
    private fetchDictionary(dictionaryName: string, filePath: string): string[] {
        const dataBuffer = fs.readFileSync(join(filePath, dictionaryName));
        const data: DictionaryData = JSON.parse(dataBuffer.toString());
        return data.words;
    }

    private loadAllDictionaries(): void {
        // TODO: Change this to upload all dictionaries from mongoDB
        // Will be removed during sprint 3
        const filePath = join(__dirname, DICTIONARY_RELATIVE_PATH);
        fs.readdirSync(filePath).forEach((dictionary) => {
            this.activeDictionaries.set(DICTIONARY_NAME, new Set(this.fetchDictionary(dictionary, filePath)));
        });
    }

    private removeAccents(word: string): string {
        return word.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
}
