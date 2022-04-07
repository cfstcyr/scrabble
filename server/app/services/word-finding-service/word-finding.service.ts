import { Service } from 'typedi';
import DictionaryService from '@app/services/dictionary-service/dictionary.service';
import AbstractWordFinding from '@app/classes/word-finding/abstract-word-finding/abstract-word-finding';
import { ScoreCalculatorService } from '@app/services/score-calculator-service/score-calculator.service';
import WordFindingHint from '@app/classes/word-finding/word-finding-hint/word-finding-hint';
import WordFindingBeginner from '@app/classes/word-finding/word-finding-beginner/word-finding-beginner';
import { WordFindingUseCase } from '@app/classes/word-finding';
import WordFindingExpert from '@app/classes/word-finding/word-finding-expert/word-finding-expert';
import { PartialWordFindingParameters, WordFindingParameters } from '@app/classes/word-finding/word-finding-types';

@Service()
export default class WordFindingService {
    constructor(private readonly dictionaryService: DictionaryService, private readonly scoreCalculatorService: ScoreCalculatorService) {}

    getWordFindingInstance(useCase: WordFindingUseCase, dictionaryId: string, params: PartialWordFindingParameters): AbstractWordFinding {
        const wordFindingParams: WordFindingParameters = [...params, this.dictionaryService.getDictionary(dictionaryId), this.scoreCalculatorService];
        switch (useCase) {
            case WordFindingUseCase.Hint:
                return new WordFindingHint(...wordFindingParams);
            case WordFindingUseCase.Beginner:
                return new WordFindingBeginner(...wordFindingParams);
            case WordFindingUseCase.Expert:
                return new WordFindingExpert(...wordFindingParams);
        }
    }
}
