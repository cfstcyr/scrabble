import { Square } from '@app/classes/square';
import { Tile } from '@app/classes/tile';

export class StringConversion {
    static wordsToString(words: [Square, Tile][][]): string[] {
        return words.map((word) => word.reduce((previous, [, tile]) => previous + StringConversion.tileToString(tile), ''));
    }

    static tileToString(tile: Tile): string {
        return tile.playedLetter ? tile.playedLetter : tile.letter;
    }
}
