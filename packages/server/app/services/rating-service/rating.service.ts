import Player from '@app/classes/player/player';
import { Service } from 'typedi';

export const WIN = 1;
export const DRAW = 0.5;
export const LOSS = 0;
export const DIFFERENCE_BASE = 400;
export const ELO_CHANGE_SPEED = 32;

@Service()
export class RatingService {
    adjustRatings(players: Player[]): void {
        for (let firstPlayerIndex = 0; firstPlayerIndex < players.length; firstPlayerIndex++) {
            for (let secondPlayerIndex = firstPlayerIndex + 1; secondPlayerIndex < players.length; secondPlayerIndex++) {
                this.evaluateWinner(players[firstPlayerIndex], players[secondPlayerIndex]);
            }
        }
    }

    private evaluateWinner(firstPlayer: Player, secondPlayer: Player): void {
        let firstPlayerResult = DRAW;
        let secondPlayerResult = DRAW;
        if (firstPlayer.score > secondPlayer.score) {
            firstPlayerResult = WIN;
            secondPlayerResult = LOSS;
        } else if (firstPlayer.score < secondPlayer.score) {
            firstPlayerResult = LOSS;
            secondPlayerResult = WIN;
        }
        const firstPlayerExpectedResult = this.calculateExpectedResult(firstPlayer.initialRating, secondPlayer.initialRating);
        firstPlayer.adjustedRating = firstPlayer.initialRating + ELO_CHANGE_SPEED * (firstPlayerResult - firstPlayerExpectedResult);
        secondPlayer.adjustedRating = secondPlayer.initialRating + ELO_CHANGE_SPEED * (secondPlayerResult - (1 - firstPlayerExpectedResult));
    }

    private calculateExpectedResult(firstPlayerRating: number, secondPlayerRating: number) {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        return 1 / (1 + Math.pow(10, (firstPlayerRating - secondPlayerRating) / DIFFERENCE_BASE));
    }
}
