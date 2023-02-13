import { Action, ActionPass } from '@app/classes/actions';
import { PlayerData } from '@app/classes/communication/player-data';
import { RoundData } from '@app/classes/communication/round-data';
import { HttpException } from '@app/classes/http-exception/http-exception';
import Player from '@app/classes/player/player';
import { INVALID_PLAYER_TO_REPLACE, NO_FIRST_ROUND_EXISTS } from '@app/constants/services-errors';
import { Random } from '@app/utils/random/random';
import { StatusCodes } from 'http-status-codes';
import { CompletedRound, Round } from './round';

const SECONDS_TO_MILLISECONDS = 1000;

export default class RoundManager {
    private player1: Player;
    private player2: Player;
    private player3: Player;
    private player4: Player;
    private currentRound: Round;
    private completedRounds: CompletedRound[];
    private maxRoundTime: number;
    private passCounter: number;

    constructor(maxRoundTime: number, player1: Player, player2: Player, player3: Player, player4: Player) {
        this.maxRoundTime = maxRoundTime;
        this.player1 = player1;
        this.player2 = player2;
        this.player3 = player3;
        this.player4 = player4;
        this.completedRounds = [];
        this.passCounter = 0;
    }

    convertRoundToRoundData(round: Round): RoundData {
        const playerData: PlayerData = {
            name: round.player.name,
            id: round.player.id,
            score: round.player.score,
            tiles: round.player.tiles,
        };
        return {
            playerData,
            startTime: round.startTime,
            limitTime: round.limitTime,
        };
    }

    nextRound(actionPlayed: Action): Round {
        if (this.currentRound !== undefined) {
            this.saveCompletedRound(this.currentRound, actionPlayed);
        }
        return this.beginRound();
    }

    beginRound(): Round {
        const player = this.getNextPlayer();
        const now = new Date();
        const limit = new Date(Date.now() + this.maxRoundTime * SECONDS_TO_MILLISECONDS);
        this.currentRound = {
            player,
            startTime: now,
            limitTime: limit,
        };
        return this.currentRound;
    }

    getCurrentRound(): Round {
        return this.currentRound;
    }

    getGameStartTime(): Date {
        if (!this.completedRounds[0] && !this.currentRound) throw new HttpException(NO_FIRST_ROUND_EXISTS, StatusCodes.NOT_FOUND);
        return this.completedRounds[0] !== undefined ? this.completedRounds[0].startTime : this.currentRound.startTime;
    }

    getMaxRoundTime(): number {
        return this.maxRoundTime;
    }

    getPassCounter(): number {
        return this.passCounter;
    }

    replacePlayer(oldPlayerId: string, newPlayer: Player): void {
        if (oldPlayerId === this.currentRound.player.id) this.currentRound.player = newPlayer;

        if (oldPlayerId === this.player1.id) this.player1 = newPlayer;
        else if (oldPlayerId === this.player2.id) this.player2 = newPlayer;
        else if (oldPlayerId === this.player3.id) this.player3 = newPlayer;
        else if (oldPlayerId === this.player4.id) this.player4 = newPlayer;
        else throw new HttpException(INVALID_PLAYER_TO_REPLACE, StatusCodes.NOT_FOUND);
    }

    private saveCompletedRound(round: Round, actionPlayed: Action): void {
        const now = new Date();
        this.passCounter = actionPlayed instanceof ActionPass ? this.passCounter + 1 : 0;
        this.completedRounds.push({ ...round, completedTime: now, actionPlayed });
    }

    private getNextPlayer(): Player {
        if (this.currentRound === undefined) {
            const startPlayerNumber = Random.randomIntFromInterval(1,4);
            if (startPlayerNumber === 1) return this.player1;
            else if (startPlayerNumber === 2) return this.player2;
            else if (startPlayerNumber === 3) return this.player3;
            else if (startPlayerNumber === 4) return this.player4;
        }
        if (this.currentRound.player === this.player1) return this.player2;
        else if (this.currentRound.player === this.player2) return this.player3;
        else if (this.currentRound.player === this.player3) return this.player4;
        else return this.player1;
    }
}
