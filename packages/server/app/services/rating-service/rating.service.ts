import Player from '@app/classes/player/player';
import { Service } from 'typedi';

export const WIN = 1;
export const DRAW = 0.5;
export const LOSS = 0;
export const DIFFERENCE_BASE = 400;
export const ELO_CHANGE_SPEED = 32;

@Service()
export class RatingService {
    static adjustRatings(players: Player[]): void {
        console.log(`BEFORE ADJUST player1 : ${players[0].publicUser.username}, initialRating=${players[0].initialRating}, adjustedRating=${players[0].adjustedRating}, score=${players[0].score}`);
        console.log(`BEFORE ADJUST player2 : ${players[1].publicUser.username}, initialRating=${players[1].initialRating}, adjustedRating=${players[1].adjustedRating}, score=${players[1].score}`);
        console.log(`BEFORE ADJUST player3 : ${players[2].publicUser.username}, initialRating=${players[2].initialRating}, adjustedRating=${players[2].adjustedRating}, score=${players[2].score}`);
        console.log(`BEFORE ADJUST player4 : ${players[3].publicUser.username}, initialRating=${players[3].initialRating}, adjustedRating=${players[3].adjustedRating}, score=${players[3].score}`);
        for (let firstPlayerIndex = 0; firstPlayerIndex < players.length; firstPlayerIndex++) {
            for (let secondPlayerIndex = firstPlayerIndex + 1; secondPlayerIndex < players.length; secondPlayerIndex++) {
                this.evaluateWinner(players[firstPlayerIndex], players[secondPlayerIndex]);
            }
        }
        console.log(`AFTER ADJUST player1 : ${players[0].publicUser.username}, initialRating=${players[0].initialRating}, adjustedRating=${players[0].adjustedRating}, score=${players[0].score}`);
        console.log(`AFTER ADJUST player2 : ${players[1].publicUser.username}, initialRating=${players[1].initialRating}, adjustedRating=${players[1].adjustedRating}, score=${players[1].score}`);
        console.log(`AFTER ADJUST player3 : ${players[2].publicUser.username}, initialRating=${players[2].initialRating}, adjustedRating=${players[2].adjustedRating}, score=${players[2].score}`);
        console.log(`AFTER ADJUST player4 : ${players[3].publicUser.username}, initialRating=${players[3].initialRating}, adjustedRating=${players[3].adjustedRating}, score=${players[3].score}`);
    }

    static adjustAbandoningUserRating(abandoningUser: Player, otherPlayers: Player[]): number {
        console.log(`BEFORE ADJUST abandoningUser : ${abandoningUser.publicUser.username}, initialRating=${abandoningUser.initialRating}, adjustedRating=${abandoningUser.adjustedRating}`);
        console.log(otherPlayers);
        for (const player of otherPlayers) {
            const abandoningUserExpectedResult = this.calculateExpectedResult(abandoningUser.initialRating, player.initialRating);
            abandoningUser.adjustedRating += ELO_CHANGE_SPEED * (LOSS - abandoningUserExpectedResult);
            console.log(`MIDWAY ADJUST abandoningUser : ${abandoningUser.publicUser.username}, initialRating=${abandoningUser.initialRating}, adjustedRating=${abandoningUser.adjustedRating}`);
        }
        console.log(`BEFORE ADJUST abandoningUser : ${abandoningUser.publicUser.username}, initialRating=${abandoningUser.initialRating}, adjustedRating=${abandoningUser.adjustedRating}`);
        return abandoningUser.adjustedRating - abandoningUser.initialRating;
    }

    private static evaluateWinner(firstPlayer: Player, secondPlayer: Player): void {
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
        console.log(`firstPlayerExpectedResult: ${firstPlayerExpectedResult}, initialRating=${firstPlayer.initialRating}, adjustedRating=${secondPlayer.initialRating}`);

        console.log(`BEFORE CHANGE adjustedRatingPlayer1=${firstPlayer.adjustedRating}, adjustedRatingPlayer2=${secondPlayer.adjustedRating}`);
        firstPlayer.adjustedRating += ELO_CHANGE_SPEED * (firstPlayerResult - firstPlayerExpectedResult);
        secondPlayer.adjustedRating += ELO_CHANGE_SPEED * (secondPlayerResult - (1 - firstPlayerExpectedResult));
        console.log(`AFTER CHANGE adjustedRatingPlayer1=${firstPlayer.adjustedRating}, adjustedRatingPlayer2=${secondPlayer.adjustedRating}`);

    }

    private static calculateExpectedResult(firstPlayerRating: number, secondPlayerRating: number) {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        return 1 / (1 + Math.pow(10, (secondPlayerRating - firstPlayerRating) / DIFFERENCE_BASE));
    }
}
