import { HINT_ACTION_NUMBER_OF_WORDS, HINT_ACTION_ATTEMPTS_NUMBER } from '@app/constants/classes-constants';
import { AbstractWordFinding, ScoredWordPlacement } from '@app/classes/word-finding';

export default class WordFindingHint extends AbstractWordFinding {
    private findingAttempts = 0;

    protected handleWordPlacement(wordPlacement: ScoredWordPlacement): void {
        this.findingAttempts++;
        if (this.wordPlacements.length < HINT_ACTION_NUMBER_OF_WORDS) {
            this.wordPlacements.push(wordPlacement);
            return;
        }
        for (let i = 0; i < this.wordPlacements.length; ++i) {
            if (this.wordPlacements[i].score < wordPlacement.score) {
                this.wordPlacements.splice(i, 1, wordPlacement);
                return;
            }
        }
    }
    protected isSearchCompleted(): boolean {
        return this.wordPlacements.length >= HINT_ACTION_NUMBER_OF_WORDS && this.findingAttempts >= HINT_ACTION_ATTEMPTS_NUMBER;
    }
}
