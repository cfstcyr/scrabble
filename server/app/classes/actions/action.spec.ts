/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai';
import { ActionClue, ActionExchange, ActionHelp, ActionPass, ActionPlace, ActionReserve } from '.';
import { Square, Orientation } from '@app/classes/board';

const DEFAULT_SQUARE: Square = {
    tile: undefined,
    multiplier: 1,
    multiplierType: 'letter',
    played: false,
};

describe('Action Clue', () => {
    let action: ActionClue;

    beforeEach(() => {
        action = new ActionClue();
    });

    it('should create', () => {
        expect(action).to.exist;
    });

    describe('execute', () => {
        it('is not yet implemented', () => {
            expect(() => action.execute()).to.throw('Method not implemented.');
        });
    });

    describe('getMessage', () => {
        it('is not yet implemented', () => {
            expect(() => action.getMessage()).to.throw('Method not implemented.');
        });
    });

    describe('willEndTurn', () => {
        it('should not end turn', () => {
            expect(action.willEndTurn()).to.be.false;
        });
    });
});

describe('Action Exchange', () => {
    let action: ActionExchange;

    beforeEach(() => {
        action = new ActionExchange([]);
    });

    it('should create', () => {
        expect(action).to.exist;
    });

    describe('execute', () => {
        it('is not yet implemented', () => {
            expect(() => action.execute()).to.throw('Method not implemented.');
        });
    });

    describe('getMessage', () => {
        it('is not yet implemented', () => {
            expect(() => action.getMessage()).to.throw('Method not implemented.');
        });
    });

    describe('willEndTurn', () => {
        it('should end turn', () => {
            expect(action.willEndTurn()).to.be.true;
        });
    });
});

describe('Action Help', () => {
    let action: ActionHelp;

    beforeEach(() => {
        action = new ActionHelp();
    });

    it('should create', () => {
        expect(action).to.exist;
    });

    describe('execute', () => {
        it('is not yet implemented', () => {
            expect(() => action.execute()).to.throw('Method not implemented.');
        });
    });

    describe('getMessage', () => {
        it('is not yet implemented', () => {
            expect(() => action.getMessage()).to.throw('Method not implemented.');
        });
    });

    describe('willEndTurn', () => {
        it('should not end turn', () => {
            expect(action.willEndTurn()).to.be.false;
        });
    });
});

describe('Action Pass', () => {
    let action: ActionPass;

    beforeEach(() => {
        action = new ActionPass();
    });

    it('should create', () => {
        expect(action).to.exist;
    });

    describe('execute', () => {
        it('is not yet implemented', () => {
            expect(() => action.execute()).to.throw('Method not implemented.');
        });
    });

    describe('getMessage', () => {
        it('is not yet implemented', () => {
            expect(() => action.getMessage()).to.throw('Method not implemented.');
        });
    });

    describe('willEndTurn', () => {
        it('should end turn', () => {
            expect(action.willEndTurn()).to.be.true;
        });
    });
});

describe('Action Place', () => {
    let action: ActionPlace;

    beforeEach(() => {
        action = new ActionPlace([], DEFAULT_SQUARE, Orientation.Vertical);
    });

    it('should create', () => {
        expect(action).to.exist;
    });

    describe('execute', () => {
        it('is not yet implemented', () => {
            expect(() => action.execute()).to.throw('Method not implemented.');
        });
    });

    describe('getMessage', () => {
        it('is not yet implemented', () => {
            expect(() => action.getMessage()).to.throw('Method not implemented.');
        });
    });

    describe('willEndTurn', () => {
        it('should end turn', () => {
            expect(action.willEndTurn()).to.be.true;
        });
    });
});

describe('Action Reserve', () => {
    let action: ActionReserve;

    beforeEach(() => {
        action = new ActionReserve();
    });

    it('should create', () => {
        expect(action).to.exist;
    });

    describe('execute', () => {
        it('is not yet implemented', () => {
            expect(() => action.execute()).to.throw('Method not implemented.');
        });
    });

    describe('getMessage', () => {
        it('is not yet implemented', () => {
            expect(() => action.getMessage()).to.throw('Method not implemented.');
        });
    });

    describe('willEndTurn', () => {
        it('should not end turn', () => {
            expect(action.willEndTurn()).to.be.false;
        });
    });
});