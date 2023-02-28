/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import Player from '@app/classes/player/player';
import WaitingRoom from './waiting-room';
import { GameConfig } from './game-config';
import { GAME_ALREADY_FULL } from '@app/constants/classes-errors';
import { GameVisibility } from '@common/models/game-visibility';
import { VirtualPlayerLevel } from '@common/models/virtual-player-level';

const ID = 'id';
const ID2 = 'id2';
const ID3 = 'id3';
const ID4 = 'id4';
const DEFAULT_GAME_CHANNEL_ID = 1;
const USER1 = { username: 'user1', email: 'email1', avatar: 'avatar1' };
const USER2 = { username: 'user2', email: 'email2', avatar: 'avatar2' };
const USER3 = { username: 'user3', email: 'email3', avatar: 'avatar3' };
const USER4 = { username: 'user4', email: 'email4', avatar: 'avatar4' };

describe('fillNextEmptySpot', () => {
    let room: WaitingRoom;
    let player: Player;

    beforeEach(() => {
        room = new WaitingRoom({} as unknown as GameConfig, DEFAULT_GAME_CHANNEL_ID);
        player = new Player(ID, USER1);
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

describe('getPlayers', () => {
    let room: WaitingRoom;
    let player1: Player;
    let player2: Player;
    let player3: Player;
    let player4: Player;

    beforeEach(() => {
        player1 = new Player(ID, USER1);
        room = new WaitingRoom({ player1 } as unknown as GameConfig, DEFAULT_GAME_CHANNEL_ID);
        player2 = new Player(ID2, USER2);
        player3 = new Player(ID3, USER3);
        player4 = new Player(ID4, USER4);
        player1.tiles = [
            { value: 1, letter: 'A' },
            { value: 4, letter: 'B' },
            { value: 2, letter: 'A' },
            { value: 4, letter: 'D' },
        ];
    });

    it('should get all players', () => {
        room.joinedPlayer3 = player3;
        expect(room.getPlayers()).to.deep.equal([player1, player3]);
    });

    it('should get all players', () => {
        room.joinedPlayer2 = player2;
        room.joinedPlayer4 = player4;
        expect(room.getPlayers()).to.deep.equal([player1, player2, player4]);
    });
});

describe('convertToGroup', () => {
    let room: WaitingRoom;
    let player1: Player;
    let player2: Player;
    let player3: Player;
    let player4: Player;

    beforeEach(() => {
        player1 = new Player(ID, USER1);
        room = new WaitingRoom(
            {
                player1,
                maxRoundTime: 60,
                gameVisibility: GameVisibility.Private,
                virtualPlayerLevel: VirtualPlayerLevel.Beginner,
            } as unknown as GameConfig,
            DEFAULT_GAME_CHANNEL_ID,
        );
        player2 = new Player(ID2, USER2);
        player3 = new Player(ID3, USER3);
        player4 = new Player(ID4, USER4);
        room.joinedPlayer2 = player2;
        room.joinedPlayer3 = player3;
        room.joinedPlayer4 = player4;
        player1.tiles = [
            { value: 1, letter: 'A' },
            { value: 4, letter: 'B' },
            { value: 2, letter: 'A' },
            { value: 4, letter: 'D' },
        ];
    });

    it('should convertToGroup', () => {
        room.joinedPlayer3 = player3;
        expect(room.convertToGroup()).to.deep.equal({
            user1: USER1,
            user2: USER2,
            user3: USER3,
            user4: USER4,
            maxRoundTime: 60,
            gameVisibility: GameVisibility.Private,
            virtualPlayerLevel: VirtualPlayerLevel.Beginner,
            groupId: room.getId(),
        });
    });
});
