/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import Game from '@app/classes/game/game';
import Player from '@app/classes/player/player';
import { ActionHelp } from '..';
import { expect } from 'chai';

const DEFAULT_PLAYER_1_NAME = 'player1';
const DEFAULT_PLAYER_1_ID = '1';

describe('ActionHelp', () => {
    let gameStub: SinonStubbedInstance<Game>;
    let action: ActionHelp;

    beforeEach(() => {
        gameStub = createStubInstance(Game);
        gameStub.player1 = new Player(DEFAULT_PLAYER_1_ID, DEFAULT_PLAYER_1_NAME);

        action = new ActionHelp(gameStub.player1, gameStub as unknown as Game);
    });

    describe('execute', () => {
        it('should execute', () => {
            expect(() => action.execute()).to.not.throw();
        });
    });

    describe('getMessage', () => {
        it('should exists', () => {
            expect(action.getMessage()).to.exist;
        });
    });

    describe('getOpponentMessage', () => {
        it('should return undefined', () => {
            expect(action.getOpponentMessage()).to.be.undefined;
        });
    });
});
