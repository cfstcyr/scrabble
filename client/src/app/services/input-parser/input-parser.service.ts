import { Injectable } from '@angular/core';
import { ActionData, ActionExchangePayload, ActionPlacePayload, ActionType } from '@app/classes/actions/action-data';
import { Message } from '@app/classes/communication/message';
import { Orientation } from '@app/classes/orientation';
import { AbstractPlayer } from '@app/classes/player';
import { Position } from '@app/classes/position';
import { LetterValue, Tile } from '@app/classes/tile';
import {
    MAX_COL_NUMBER,
    MAX_LOCATION_COMMAND_LENGTH,
    MAX_ROW_NUMBER,
    MIN_COL_NUMBER,
    MIN_LOCATION_COMMAND_LENGTH,
    MIN_ROW_NUMBER
} from '@app/constants/game';
import { GamePlayController } from '@app/controllers/game-play-controller/game-play.controller';
import { BehaviorSubject } from 'rxjs';
import { GameService } from '..';
import { CommandErrorMessages } from './command-error-messages';
import CommandError from './command-errors';

const ASCII_VALUE_OF_LOWERCASE_A = 97;

@Injectable({
    providedIn: 'root',
})
export default class InputParserService {
    private newMessageValue = new BehaviorSubject<Message>({
        content: 'Début de la partie',
        senderId: 'System',
    });

    constructor(private controller: GamePlayController, private gameService: GameService) {
        this.gameService.newMessageValue.subscribe((newMessage) => {
            this.emitNewMessage(newMessage);
        });
    }

    emitNewMessage(newMessage: Message): void {
        this.newMessageValue.next(newMessage);
    }

    parseInput(input: string): void {
        const playerId = this.getLocalPlayerId();
        if (input[0] === '!') {
            // it is an action
            const inputWords: string[] = input.substring(1).split(' ');
            const actionName: string = inputWords[0];

            try {
                this.parseCommand(actionName, inputWords);
            } catch (e) {
                if (e instanceof CommandError) {
                    this.newMessageValue.next({
                        content: `La commande ${input} est invalide`,
                        senderId: 'System',
                    });
                }
            }
        }
        this.controller.sendMessage(this.gameService.getGameId(), playerId, {
            content: input,
            senderId: this.getLocalPlayer().id,
        });
    }

    private parseCommand(actionName: string, inputWords: string[]) {
        const playerId = this.getLocalPlayerId();
        const gameId: string = this.gameService.getGameId();
        let actionData: ActionData;

        switch (actionName) {
            case 'placer':
                if (inputWords.length !== 3) throw new CommandError(CommandErrorMessages.BadSyntax);

                if (inputWords[2].length === 1) {
                    actionData = {
                        type: ActionType.PLACE,
                        payload: this.createPlaceActionPayloadSingleLetter(inputWords[1], inputWords[2]),
                    };
                } else {
                    actionData = {
                        type: ActionType.PLACE,
                        payload: this.createPlaceActionPayloadMultipleLetters(inputWords[1], inputWords[2]),
                    };
                }
                this.controller.sendAction(gameId, playerId, actionData);
                break;
            case 'échanger':
                if (inputWords.length !== 2) throw new CommandError(CommandErrorMessages.BadSyntax);

                actionData = {
                    type: ActionType.EXCHANGE,
                    payload: this.createExchangeActionPayload(inputWords[1]),
                };
                this.controller.sendAction(gameId, playerId, actionData);
                break;
            case 'passer':
                if (inputWords.length !== 1) throw new CommandError(CommandErrorMessages.BadSyntax);
                actionData = {
                    type: ActionType.PASS,
                    payload: {},
                };
                this.controller.sendAction(gameId, playerId, actionData);
                break;
            case 'réserve':
                if (inputWords.length !== 1) throw new CommandError(CommandErrorMessages.BadSyntax);
                // this.controller.sendReserveAction();
                break;
            case 'indice':
                if (inputWords.length !== 1) throw new CommandError(CommandErrorMessages.BadSyntax);
                // this.controller.sendHintAction();
                break;
            case 'aide':
                if (inputWords.length !== 1) throw new CommandError(CommandErrorMessages.BadSyntax);
                // this.controller.sendHelpAction();
                break;
            default:
                throw new CommandError(CommandErrorMessages.InvalidEntry);
        }
    }

    private createPlaceActionPayloadSingleLetter(location: string, lettersToPlace: string): ActionPlacePayload {
        const lastLocationChar = location.charAt(location.length - 1);
        let positionString = '';
        if (lastLocationChar.toLowerCase() === lastLocationChar.toUpperCase()) {
            positionString = location;
        } else {
            positionString = location.substring(0, location.length - 1);
        }

        const placeActionPayload: ActionPlacePayload = {
            tiles: this.parsePlaceLettersToTiles(lettersToPlace),
            startPosition: this.getStartPosition(positionString),
            orientation: Orientation.Horizontal,
        };

        return placeActionPayload;
    }

    private createPlaceActionPayloadMultipleLetters(location: string, lettersToPlace: string): ActionPlacePayload {
        const placeActionPayload: ActionPlacePayload = {
            tiles: this.parsePlaceLettersToTiles(lettersToPlace),
            startPosition: this.getStartPosition(location.substring(0, location.length - 1)),
            orientation: this.getOrientation(location.charAt(location.length - 1)),
        };

        return placeActionPayload;
    }

    private createExchangeActionPayload(lettersToExchange: string): ActionExchangePayload {
        const exchangeActionPayload: ActionExchangePayload = {
            tiles: this.parseExchangeLettersToTiles(lettersToExchange),
        };

        return exchangeActionPayload;
    }

    private parsePlaceLettersToTiles(lettersToPlace: string): Tile[] {
        const player: AbstractPlayer = this.getLocalPlayer();
        const playerTiles: Tile[] = [];
        player.getTiles().forEach((tile) => {
            playerTiles.push(new Tile(tile.letter, tile.value));
        });
        const tilesToPlace: Tile[] = [];

        for (const letter of lettersToPlace) {
            for (let i = Object.values(playerTiles).length - 1; i >= 0; i--) {
                if (playerTiles[i].letter.toLowerCase() === letter) {
                    tilesToPlace.push(playerTiles.splice(i, 1)[0]);
                    break;
                } else if (playerTiles[i].letter === '*' && (letter as LetterValue) && letter === letter.toUpperCase()) {
                    const tile = playerTiles.splice(i, 1)[0];
                    tilesToPlace.push(new Tile(letter as LetterValue, tile.value));
                    break;
                }
            }
        }

        if (tilesToPlace.length !== lettersToPlace.length) throw new CommandError(CommandErrorMessages.ImpossibleCommand);

        return tilesToPlace;
    }

    private parseExchangeLettersToTiles(lettersToExchange: string): Tile[] {
        // user must type exchange letters in lower case
        if (lettersToExchange !== lettersToExchange.toLowerCase()) throw new CommandError(CommandErrorMessages.BadSyntax);

        const player: AbstractPlayer = this.getLocalPlayer();
        const playerTiles: Tile[] = [];
        player.getTiles().forEach((tile) => {
            playerTiles.push(new Tile(tile.letter, tile.value));
        });
        const tilesToExchange: Tile[] = [];

        for (const letter of lettersToExchange) {
            for (let i = Object.values(playerTiles).length - 1; i >= 0; i--) {
                if (playerTiles[i].letter.toLowerCase() === letter) {
                    const tile = playerTiles.splice(i, 1)[0];
                    tilesToExchange.push(tile);
                    break;
                }
            }
        }

        if (tilesToExchange.length !== lettersToExchange.length) throw new CommandError(CommandErrorMessages.ImpossibleCommand);

        return tilesToExchange;
    }

    private getStartPosition(location: string): Position {
        if (location.length > MAX_LOCATION_COMMAND_LENGTH || location.length < MIN_LOCATION_COMMAND_LENGTH) {
            throw new CommandError(CommandErrorMessages.BadSyntax);
        }

        const inputRow: number = location[0].charCodeAt(0) - ASCII_VALUE_OF_LOWERCASE_A;
        if (inputRow < MIN_ROW_NUMBER || inputRow > MAX_ROW_NUMBER) {
            throw new CommandError(CommandErrorMessages.ImpossibleCommand);
        }

        const inputCol: number = +location.substring(1) - 1;
        if (inputCol < MIN_COL_NUMBER || inputCol > MAX_COL_NUMBER) {
            throw new CommandError(CommandErrorMessages.ImpossibleCommand);
        }

        const inputStartPosition: Position = {
            row: inputRow,
            column: inputCol,
        };
        return inputStartPosition;
    }

    private getOrientation(orientationString: string): Orientation {
        if (orientationString.length !== 1) throw new CommandError(CommandErrorMessages.BadSyntax);

        if (orientationString === 'h') return Orientation.Horizontal;
        else if (orientationString === 'v') return Orientation.Vertical;
        else throw new CommandError(CommandErrorMessages.BadSyntax);
    }

    private getLocalPlayerId(): string {
        let playerId: string;
        const localPlayer: AbstractPlayer | undefined = this.gameService.getLocalPlayer();
        if (localPlayer instanceof AbstractPlayer) {
            playerId = localPlayer.id;
        } else {
            throw new Error('Current player could not be found');
        }

        return playerId;
    }

    private getLocalPlayer(): AbstractPlayer {
        let player: AbstractPlayer;
        const localPlayer: AbstractPlayer | undefined = this.gameService.getLocalPlayer();
        if (localPlayer instanceof AbstractPlayer) {
            player = localPlayer;
        } else {
            throw new Error('Current player could not be found');
        }

        return player;
    }
}
