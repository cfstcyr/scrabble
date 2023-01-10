import { LetterValue } from './tile.types';

export default interface Tile {
    letter: LetterValue;
    value: number;
    isBlank?: boolean;
    playedLetter?: LetterValue; // Used when letter is *
}
