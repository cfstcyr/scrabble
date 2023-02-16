/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-unused-expressions */
import { GameUpdateData } from '@app/classes/communication/game-update-data';
import { expect } from 'chai';
import { fillPlayerData } from './fill-player-data';

describe('fillPlayerData', () => {
    it('should update player 1 if given number 1', () => {
        const gameUpdateData: GameUpdateData = {};
        fillPlayerData(gameUpdateData, 1, { id: 'id' });
        expect(gameUpdateData.player1).to.exist;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        expect(gameUpdateData.player1!.id).to.equal('id');
    });

    it('should update player 2 if given number 2', () => {
        const gameUpdateData: GameUpdateData = {};
        fillPlayerData(gameUpdateData, 2, { id: 'id' });
        expect(gameUpdateData.player2).to.exist;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        expect(gameUpdateData.player2!.id).to.equal('id');
    });

    it('should overwrite player 2 if given number 2', () => {
        const gameUpdateData: GameUpdateData = { player2: { id: 'yoooo' } };
        fillPlayerData(gameUpdateData, 2, { id: 'id' });
        expect(gameUpdateData.player2).to.exist;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        expect(gameUpdateData.player2!.id).to.equal('id');
    });
});
