import { AbstractObjective } from '@app/classes/objectives/abstract-objective';
import { ObjectiveValidationParameters } from '@app/classes/objectives/validation-parameters';
import { LetterValue } from '@app/classes/tile';
import { StringConversion } from '@app/utils/string-conversion';

export const NAME = 'Les bases';
export const DESCRIPTION = 'Jouer chaque voyelle au moins une fois (inclue les lettres blanches)';
export const BONUS_POINTS = 30;
export const VOWELS = (): LetterValue[] => ['A', 'E', 'I', 'O', 'U', 'Y'];

const SHOULD_RESET = false;

export class FourVowelsWordObjective extends AbstractObjective {
    private vowelsLeftToPlay: LetterValue[];

    constructor() {
        super(NAME, DESCRIPTION, BONUS_POINTS, SHOULD_RESET, VOWELS().length);
        this.vowelsLeftToPlay = VOWELS();
    }
    updateProgress(validationParameters: ObjectiveValidationParameters): void {
        const letterPlayed: LetterValue[] = validationParameters.wordPlacement.tilesToPlace.map(
            (t) => StringConversion.tileToString(t) as LetterValue,
        );
        letterPlayed.forEach((letter: LetterValue) => {
            if (this.vowelsLeftToPlay.includes(letter)) {
                this.progress++;
                this.vowelsLeftToPlay.splice(this.vowelsLeftToPlay.indexOf(letter), 1);
            }
        });
    }

    clone(): FourVowelsWordObjective {
        const clone = new FourVowelsWordObjective();
        clone.progress = this.progress;
        clone.state = this.state;
        clone.isPublic = this.isPublic;
        clone.vowelsLeftToPlay = this.vowelsLeftToPlay;
        return clone;
    }
}
