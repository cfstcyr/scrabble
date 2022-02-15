/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable dot-notation */
import { Action, ActionExchange, ActionHelp, ActionPass, ActionPlace, ActionReserve } from '@app/classes/actions';
import { Orientation } from '@app/classes/board';
import { ActionData, ActionExchangePayload, ActionPlacePayload, ActionType } from '@app/classes/communication/action-data';
import { GameUpdateData } from '@app/classes/communication/game-update-data';
import { RoundData } from '@app/classes/communication/round-data';
import Game from '@app/classes/game/game';
import Player from '@app/classes/player/player';
import { Round } from '@app/classes/round/round';
import RoundManager from '@app/classes/round/round-manager';
import { LetterValue, TileReserve } from '@app/classes/tile';
import { INVALID_COMMAND, INVALID_PAYLOAD, NOT_PLAYER_TURN } from '@app/constants/services-errors';
import { ActiveGameService } from '@app/services/active-game-service/active-game.service';
import { GamePlayService } from '@app/services/game-play-service/game-play.service';
import * as chai from 'chai';
import { EventEmitter } from 'events';
import { createStubInstance, restore, SinonStub, SinonStubbedInstance, stub } from 'sinon';
import { Container } from 'typedi';
const expect = chai.expect;

const DEFAULT_GAME_ID = 'gameId';
const DEFAULT_PLAYER_ID = '1';
const INVALID_PLAYER_ID = 'invalid-id';
const DEFAULT_PLAYER_NAME = 'player 1';
const DEFAULT_PLAYER_SCORE = 5;
const DEFAULT_INPUT = 'input';
const DEFAULT_ACTION: ActionData = { type: 'exchange', payload: {}, input: DEFAULT_INPUT };
const INVALID_ACTION_TYPE = 'invalid action type';
const DEFAULT_GET_TILES_PER_LETTER_ARRAY: [LetterValue, number][] = [
    ['A', 1],
    ['B', 2],
    ['C', 3],
    ['D', 0],
    ['E', 2],
];
const DEFAULT_ACTION_MESSAGE = 'default action message';

describe('GamePlayService', () => {
    let gamePlayService: GamePlayService;
    let getGameStub: SinonStub;
    let gameStub: SinonStubbedInstance<Game>;
    let roundManagerStub: SinonStubbedInstance<RoundManager>;
    let tileReserveStub: SinonStubbedInstance<TileReserve>;
    let round: Round;
    let player: Player;
    let game: Game;

    beforeEach(() => {
        gamePlayService = Container.get(GamePlayService);
        gameStub = createStubInstance(Game);
        roundManagerStub = createStubInstance(RoundManager);
        tileReserveStub = createStubInstance(TileReserve);

        gameStub.player1 = new Player(DEFAULT_PLAYER_ID, DEFAULT_PLAYER_NAME);
        gameStub.getRequestingPlayer.returns(gameStub.player1);
        gameStub.roundManager = roundManagerStub as unknown as RoundManager;
        gameStub['tileReserve'] = tileReserveStub as unknown as TileReserve;

        round = { player: gameStub.player1, startTime: new Date(), limitTime: new Date() };
        roundManagerStub.nextRound.returns(round);

        gameStub.endOfGame.returns([DEFAULT_PLAYER_SCORE, DEFAULT_PLAYER_SCORE]);
        gameStub['getTilesLeftPerLetter'].returns(new Map(DEFAULT_GET_TILES_PER_LETTER_ARRAY));

        player = gameStub.player1;
        game = gameStub as unknown as Game;

        getGameStub = stub(gamePlayService['activeGameService'], 'getGame').returns(gameStub as unknown as Game);
    });

    afterEach(() => {
        getGameStub.restore();
    });

    describe('playAction', () => {
        let actionStub: SinonStubbedInstance<Action>;
        let getActionStub: SinonStub;

        beforeEach(() => {
            actionStub = createStubInstance(ActionPass);
            actionStub.willEndTurn.returns(true);
            getActionStub = stub(gamePlayService, 'getAction').returns(actionStub as unknown as Action);
            actionStub.getMessage.returns(DEFAULT_ACTION_MESSAGE);
            actionStub.getOpponentMessage.returns(DEFAULT_ACTION_MESSAGE);
        });

        afterEach(() => {
            restore();
        });

        it('should call getGame', () => {
            gamePlayService.playAction(DEFAULT_GAME_ID, player.getId(), DEFAULT_ACTION);
            expect(getGameStub.called).to.be.true;
        });

        it('should call getMessage', () => {
            gamePlayService.playAction(DEFAULT_GAME_ID, player.getId(), DEFAULT_ACTION);
            expect(actionStub.getMessage.called).to.be.true;
        });

        it('should call getOpponentMessage', () => {
            gamePlayService.playAction(DEFAULT_GAME_ID, player.getId(), DEFAULT_ACTION);
            expect(actionStub.getOpponentMessage.called).to.be.true;
        });

        it('should call getAction', () => {
            gamePlayService.playAction(DEFAULT_GAME_ID, player.getId(), DEFAULT_ACTION);
            expect(getActionStub.called).to.be.true;
        });

        it('should call execute', () => {
            gamePlayService.playAction(DEFAULT_GAME_ID, player.getId(), DEFAULT_ACTION);
            expect(actionStub.execute.called).to.be.true;
        });

        it('should call isGameOver', () => {
            gamePlayService.playAction(DEFAULT_GAME_ID, player.getId(), DEFAULT_ACTION);
            expect(gameStub.isGameOver.called).to.be.true;
        });

        it('should set isGameOver to true if gameOver (updatedData exists #1)', () => {
            gameStub.isGameOver.returns(true);
            actionStub.willEndTurn.returns(true);
            actionStub.execute.returns({ tileReserve: [{ letter: 'A', amount: 3 }] } as GameUpdateData);
            const result = gamePlayService.playAction(DEFAULT_GAME_ID, player.getId(), DEFAULT_ACTION);
            expect(result).to.exist;
            expect(result[0]!.isGameOver).to.be.true;
        });

        it('should set isGameOver to true if gameOver (updatedData exists #2)', () => {
            gameStub.isGameOver.returns(true);
            actionStub.willEndTurn.returns(true);
            actionStub.execute.returns({ player1: { score: DEFAULT_PLAYER_SCORE }, player2: { score: DEFAULT_PLAYER_SCORE } } as GameUpdateData);
            const result = gamePlayService.playAction(DEFAULT_GAME_ID, player.getId(), DEFAULT_ACTION);
            expect(result).to.exist;
            expect(result[0]!.isGameOver).to.be.true;
        });

        it("should set isGameOver to true if gameOver (updatedData doesn't exists)", () => {
            gameStub.isGameOver.returns(true);
            actionStub.willEndTurn.returns(true);

            actionStub.execute.callsFake(() => {
                return;
            });

            const result = gamePlayService.playAction(DEFAULT_GAME_ID, player.getId(), DEFAULT_ACTION);
            expect(result).to.exist;
            expect(result[0]!.isGameOver).to.be.true;
        });

        it('should call next round when action ends turn', () => {
            actionStub.willEndTurn.returns(true);
            gamePlayService.playAction(DEFAULT_GAME_ID, player.getId(), DEFAULT_ACTION);
            expect(roundManagerStub.nextRound.called).to.be.true;
        });

        it('should set round action end turn (updatedData exists)', () => {
            actionStub.willEndTurn.returns(true);
            actionStub.execute.returns({});
            roundManagerStub.convertRoundToRoundData.returns({} as RoundData);
            const result = gamePlayService.playAction(DEFAULT_GAME_ID, player.getId(), DEFAULT_ACTION);
            expect(result).to.exist;
            expect(result[0]!.round).to.exist;
        });

        it("should set round action end turn (updatedData doesn't exists)", () => {
            actionStub.willEndTurn.returns(true);
            actionStub.execute.returns(undefined);
            roundManagerStub.convertRoundToRoundData.returns({} as RoundData);
            const result = gamePlayService.playAction(DEFAULT_GAME_ID, player.getId(), DEFAULT_ACTION);
            expect(result).to.exist;
            expect(result[0]!.round).to.exist;
        });

        it('should not call next round when action does not ends turn', () => {
            actionStub.willEndTurn.returns(false);
            gamePlayService.playAction(DEFAULT_GAME_ID, player.getId(), DEFAULT_ACTION);
            expect(roundManagerStub.nextRound.called).to.not.be.true;
        });

        it('should throw when playerId is invalid', () => {
            expect(() => gamePlayService.playAction(DEFAULT_GAME_ID, INVALID_PLAYER_ID, DEFAULT_ACTION)).to.throw(NOT_PLAYER_TURN);
        });

        it('should return tileReserve if updatedData exists', () => {
            actionStub.execute.returns({});
            const result = gamePlayService.playAction(DEFAULT_GAME_ID, player.getId(), DEFAULT_ACTION);
            expect(result).to.exist;
            expect(result[0]!.tileReserve).to.exist;

            for (const [expectedLetter, expectedAmount] of DEFAULT_GET_TILES_PER_LETTER_ARRAY) {
                expect(result[0]!.tileReserve!.some(({ letter, amount }) => expectedLetter === letter && expectedAmount === amount)).to.be.true;
            }
        });

        it('should return tileReserveTotal if updatedData exists', () => {
            actionStub.execute.returns({});
            const result = gamePlayService.playAction(DEFAULT_GAME_ID, player.getId(), DEFAULT_ACTION);
            expect(result).to.exist;
            expect(result[0]!.tileReserveTotal).to.exist;
            expect(result[0]!.tileReserveTotal).to.equal(DEFAULT_GET_TILES_PER_LETTER_ARRAY.reduce((prev, [, amount]) => (prev += amount), 0));
        });

        it('should call getMessage from action', () => {
            gamePlayService.playAction(DEFAULT_GAME_ID, player.getId(), DEFAULT_ACTION);
            expect(actionStub.getMessage.calledOnce).to.be.true;
        });

        it('should call getOpponentMessage from action', () => {
            gamePlayService.playAction(DEFAULT_GAME_ID, player.getId(), DEFAULT_ACTION);
            expect(actionStub.getOpponentMessage.calledOnce).to.be.true;
        });

        it('should return opponentFeedback equal to getOppnentMessage from action', () => {
            const [, feedback] = gamePlayService.playAction(DEFAULT_GAME_ID, player.getId(), DEFAULT_ACTION);
            expect(feedback!.opponentFeedback).to.equal(DEFAULT_ACTION_MESSAGE);
        });
    });

    describe('getAction', () => {
        it('should fail when type is invalid', () => {
            expect(() => {
                gamePlayService.getAction(player, game, { type: INVALID_ACTION_TYPE as unknown as ActionType, payload: {}, input: DEFAULT_INPUT });
            }).to.throw(INVALID_COMMAND);
        });

        it('should return action of type ActionPlace when type is place', () => {
            const type = 'place';
            const payload: ActionPlacePayload = {
                tiles: [],
                startPosition: { column: 0, row: 0 },
                orientation: Orientation.Horizontal,
            };
            const action = gamePlayService.getAction(player, game, { type, payload, input: DEFAULT_INPUT });
            expect(action).to.be.instanceOf(ActionPlace);
        });

        it('should return action of type ActionExchange when type is exchange', () => {
            const type = 'exchange';
            const payload: ActionExchangePayload = {
                tiles: [],
            };
            const action = gamePlayService.getAction(player, game, { type, payload, input: DEFAULT_INPUT });
            expect(action).to.be.instanceOf(ActionExchange);
        });

        it('should return action of type ActionPass when type is pass', () => {
            const type = 'pass';
            const payload = {};
            const action = gamePlayService.getAction(player, game, { type, payload, input: DEFAULT_INPUT });
            expect(action).to.be.instanceOf(ActionPass);
        });

        it('should return action of type ActionHelp when type is help', () => {
            const type = 'help';
            const payload = {};
            const action = gamePlayService.getAction(player, game, { type, payload, input: DEFAULT_INPUT });
            expect(action).to.be.instanceOf(ActionHelp);
        });

        it('should return action of type ActionReserve when type is reserve', () => {
            const type = 'reserve';
            const payload = {};
            const action = gamePlayService.getAction(player, game, { type, payload, input: DEFAULT_INPUT });
            expect(action).to.be.instanceOf(ActionReserve);
        });

        it("should throw if place payload doesn't have tiles", () => {
            const type = 'place';
            const payload: Omit<ActionPlacePayload, 'tiles'> = {
                startPosition: { column: 0, row: 0 },
                orientation: Orientation.Horizontal,
            };
            expect(() => gamePlayService.getAction(player, game, { type, payload, input: DEFAULT_INPUT })).to.throw(INVALID_PAYLOAD);
        });

        it("should throw if place payload doesn't have startPosition", () => {
            const type = 'place';
            const payload: Omit<ActionPlacePayload, 'startPosition'> = {
                tiles: [],
                orientation: Orientation.Horizontal,
            };
            expect(() => gamePlayService.getAction(player, game, { type, payload, input: DEFAULT_INPUT })).to.throw(INVALID_PAYLOAD);
        });

        it("should throw if place payload doesn't have orientation", () => {
            const type = 'place';
            const payload: Omit<ActionPlacePayload, 'orientation'> = {
                tiles: [],
                startPosition: { column: 0, row: 0 },
            };
            expect(() => gamePlayService.getAction(player, game, { type, payload, input: DEFAULT_INPUT })).to.throw(INVALID_PAYLOAD);
        });

        it("should throw if exchange payload doesn't have tiles", () => {
            const type = 'exchange';
            const payload: Omit<ActionExchangePayload, 'tiles'> = {};
            expect(() => gamePlayService.getAction(player, game, { type, payload, input: DEFAULT_INPUT })).to.throw(INVALID_PAYLOAD);
        });
    });

    describe('PlayerLeftEvent', () => {
        const playerWhoLeftId = 'playerWhoLeftId';
        let activeGameServiceStub: SinonStubbedInstance<ActiveGameService>;

        beforeEach(() => {
            activeGameServiceStub = createStubInstance(ActiveGameService);
            activeGameServiceStub.playerLeftEvent = new EventEmitter();
            activeGameServiceStub.getGame.returns(gameStub as unknown as Game);

            gamePlayService = new GamePlayService(activeGameServiceStub as unknown as ActiveGameService);
        });

        it('On receive player left event, should call handlePlayerLeftEvent', () => {
            const handlePlayerLeftEventSpy = chai.spy.on(gamePlayService, 'handlePlayerLeftEvent', () => {
                return;
            });
            gamePlayService['activeGameService'].playerLeftEvent.emit('playerLeft', DEFAULT_GAME_ID, playerWhoLeftId);
            expect(handlePlayerLeftEventSpy).to.have.been.called.with(DEFAULT_GAME_ID, playerWhoLeftId);
        });

        it('handlePlayerLeftEvent should emit playerLeftFeedback', () => {
            gameStub.player1 = new Player(DEFAULT_PLAYER_ID, 'Cool Guy Name');
            gameStub.player2 = new Player(playerWhoLeftId, 'LeaverName');
            const playerStillInGame: Player = gameStub.player1;
            const updatedData: GameUpdateData = {};
            const endOfGameMessages: string[] = ['test'];

            const handleGameOverSpy = chai.spy.on(gamePlayService, 'handleGameOver', () => endOfGameMessages);
            const emitSpy = chai.spy.on(gamePlayService['activeGameService'].playerLeftEvent, 'emit', () => {
                return;
            });

            gamePlayService.handlePlayerLeftEvent(DEFAULT_GAME_ID, playerWhoLeftId);
            expect(handleGameOverSpy).to.have.been.called.with(playerStillInGame.name, gameStub, updatedData);
            expect(emitSpy).to.have.been.called.with('playerLeftFeedback', DEFAULT_GAME_ID, endOfGameMessages, updatedData);
        });
    });
});
