/* eslint-disable complexity */
import { DictionaryNode } from '@app/classes/dictionary';
import { BoardPlacement } from '@app/classes/word-finding';
import { LETTER_VALUES } from '@app/constants/game-constants';
import { Random } from '@app/utils/random/random';

export class DictionarySearcherRandom {
    constructor(private node: DictionaryNode, private boardPlacement: BoardPlacement) {}

    *[Symbol.iterator](): Generator<string> {
        const { minSize, maxSize, letters } = this.boardPlacement;

        const lettersMap = new Map(letters.map(({ distance, letter }) => [distance, letter.toLowerCase()]));
        const perpendicularMap = new Map<number, string[] | null>();

        const stack: DictionaryNode[][] = [];
        let currentNode: DictionaryNode | undefined = this.node;

        do {
            const value = currentNode.getValue();

            // Check wether the value meets the criteria
            if (value && value.length >= minSize && value.length <= maxSize) {
                yield value;
            }

            // If we are deeper than the max length, we don't need to continue the search deeper.
            if (currentNode.getDepth() < maxSize - 1) {
                const fixedLetter = lettersMap.get(stack.length);
                let validLetters = perpendicularMap.get(stack.length);

                if (validLetters === undefined) {
                    validLetters = this.getPerpendicularLetters(stack.length);
                    perpendicularMap.set(stack.length, validLetters);
                }

                // If the letter for this position is fixed, only pass the letter's node to the next level.
                // Otherwise, pass all children nodes to the next level.
                if (fixedLetter) {
                    const nextNode = currentNode.getNode(fixedLetter.toLowerCase());
                    if (nextNode) {
                        stack.push([nextNode]);
                    }
                } else if (validLetters) {
                    const nextNodes = validLetters.map((letter) => currentNode?.getNode(letter)).filter((node): node is DictionaryNode => !!node);
                    if (nextNodes.length > 0) stack.push(nextNodes);
                } else {
                    const nextNodes = currentNode.getNodes();
                    if (nextNodes.length > 0) {
                        stack.push(nextNodes);
                    }
                }
            }

            // Clear empty levels.
            while (stack.length > 0 && stack[stack.length - 1].length === 0) {
                stack.pop();
            }
        } while (stack.length > 0 && (currentNode = Random.popRandom(stack[stack.length - 1])));
    }

    private getPerpendicularLetters(distance: number): string[] | null {
        const perpendicularLetters = this.boardPlacement.perpendicularLetters.find(({ distance: d }) => distance === d);

        if (!perpendicularLetters) return null;

        const res = LETTER_VALUES.filter((letter) =>
            this.node.wordExists(
                `${perpendicularLetters.before.join('')}${letter.toLowerCase()}${perpendicularLetters.after.join('')}`.toLowerCase(),
            ),
        ).map((letter) => letter.toLowerCase());

        return res;
    }
}
