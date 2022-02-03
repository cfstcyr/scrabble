import { INVALID_WORD, MINIMUM_WORD_LEN } from '@app/constants/errors';
import { Service } from 'typedi';

@Service()
export class WordsVerificationService {
    activeDictionaries: Map<string, Set<string>>;

    constructor() {
        this.openAllDictionaries();
    }

    openAllDictionaries() {
        this.addDictionary();
    }

    // À mettre dans un service à part
    addDictionary() {
        const name = 'dictionary_log2990';
        const fs = require('fs');
        const rawData = fs.readFileSync('assets/dictionaries/dictionnary.json');
        const dictionary = JSON.parse(rawData);
        this.activeDictionaries[name] = new Set(dictionary.words);
    }

    verifyWords(words: string[][], dictionary: string) {
        for (const word in words) {
            if (word != null) {
                this.removeAccents(word);
                if (words.length > MINIMUM_WORD_LEN) {
                    throw new Error(INVALID_WORD);
                }
                if (word.includes('-')) {
                    throw new Error(INVALID_WORD);
                }
                if (word.includes("'")) {
                    throw new Error(INVALID_WORD);
                }
                if (this.activeDictionaries.get(dictionary)?.has(word)) {
                    throw new Error(INVALID_WORD);
                }
            }
        }
    }

    removeAccents(word: string) {
        return word.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
}
