import { LetterPosition } from '@app/classes/word-finding';

export interface RandomWordParameters {
    /** Minimum length of the word */
    minLength: number;
    /** Maximum length of the word */
    maxLength: number;
    /**
     * Probability of accepting a word with a length of minLength
     *
     * Must be between `0` and `1`
     *
     * Must be lower than `maxProbability`
     */
    minProbability: number;
    /**
     * Probability of accepting a word with a length of maxLength
     *
     * Must be between `0` and `1`
     *
     * Must be greater than `minProbability`
     */
    maxProbability: number;
    /**
     * Only return a word with the letters at the specified positions.
     *
     * Example :
     * ```typescript
     * fixedLetters: [{ letter: 'A', distance: 2 }];
     * // Will return a word where the 3rd letter is 'A'
     * ```
     */
    fixedLetters: LetterPosition[];
}
