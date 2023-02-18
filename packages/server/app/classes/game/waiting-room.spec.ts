/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import Player from '@app/classes/player/player';
import WaitingRoom from './waiting-room';
import { GameConfig } from './game-config';
import { GAME_ALREADY_FULL } from '@app/constants/classes-errors';

const ID = 'id';
const DEFAULT_NAME = 'player';
const DEFAULT_GAME_CHANNEL_ID = 1;

describe('fillNextEmptySpot', () => {
    let room: WaitingRoom;
    let player: Player;

    beforeEach(() => {
        room = new WaitingRoom({} as unknown as GameConfig, DEFAULT_GAME_CHANNEL_ID);
        player = new Player(ID, DEFAULT_NAME);
        player.tiles = [
            { value: 1, letter: 'A' },
            { value: 4, letter: 'B' },
            { value: 2, letter: 'A' },
            { value: 4, letter: 'D' },
        ];
    });

    it('should fill player 2 if it is undefined', () => {
        room.fillNextEmptySpot(player);
        expect(room.joinedPlayer2).to.equal(player);
        expect(room.joinedPlayer3).not.to.exist;
        expect(room.joinedPlayer4).not.to.exist;
    });

    it('should fill player 3 if it is undefined and 2 is defined', () => {
        room.joinedPlayer2 = {} as unknown as Player;
        room.fillNextEmptySpot(player);
        expect(room.joinedPlayer2).to.exist;
        expect(room.joinedPlayer3).to.equal(player);
        expect(room.joinedPlayer4).not.to.exist;
    });

    it('should fill player 4 if it is undefined and 2 and 3 is defined', () => {
        room.joinedPlayer2 = {} as unknown as Player;
        room.joinedPlayer3 = {} as unknown as Player;
        room.fillNextEmptySpot(player);
        expect(room.joinedPlayer2).to.exist;
        expect(room.joinedPlayer3).to.exist;
        expect(room.joinedPlayer4).to.equal(player);
    });
    it('should throw it is full', () => {
        room.joinedPlayer2 = {} as unknown as Player;
        room.joinedPlayer3 = {} as unknown as Player;
        room.joinedPlayer4 = {} as unknown as Player;
        const result = () => {
            room.fillNextEmptySpot(player);
        };
        expect(result).to.throw(GAME_ALREADY_FULL);
    });
});
