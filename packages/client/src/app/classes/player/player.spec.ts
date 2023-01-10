/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-magic-numbers */

import { PlayerData } from '@app/classes/communication/';
import { Tile } from '@app/classes/tile';
import { Player } from '.';

describe('Player', () => {
    const playerDataTestCases: PlayerData[] = [
        {
            name: 'testName2',
            id: 'testId2',
            newId: 'testId2',
            score: 10,
            tiles: [{ letter: 'Z', value: 10 }],
        },
        {
            newId: 'testId2',
            id: 'testId2',
            score: 10,
            tiles: [{ letter: 'Z', value: 10 }],
        },
        {
            id: 'test',
            name: 'testName2',
            score: 10,
            tiles: [{ letter: 'Z', value: 10 }],
        },
        {
            name: 'testName2',
            id: 'testId2',
            tiles: [{ letter: 'Z', value: 10 }],
        },
        {
            name: 'testName2',
            id: 'testId2',
            score: 10,
        },
    ];

    it('Creating Player should initialize attributes', () => {
        const id = 'testId';
        const name = 'testName';
        const tiles: Tile[] = [{ letter: 'A', value: 10 }];
        const player = new Player(id, name, tiles);
        expect(player.id).toEqual(id);
        expect(player.name).toEqual(name);
        expect(player['tiles']).toEqual(tiles);
    });

    it('Creating Player should not set tiles attribute to same reference', () => {
        const id = 'testId';
        const name = 'testName';
        const tiles: Tile[] = [
            { letter: 'A', value: 10 },
            { letter: 'B', value: 10 },
        ];
        const player = new Player(id, name, tiles);
        expect(player['tiles'] === tiles).toBeFalsy();
    });

    it('getTiles should return player tiles', () => {
        const id = 'testId';
        const name = 'testName';
        const tiles: Tile[] = [
            { letter: 'A', value: 10 },
            { letter: 'B', value: 10 },
        ];
        const player = new Player(id, name, tiles);
        expect(player['tiles']).toEqual(player.getTiles());
    });

    it('getTiles should return new instance of player tiles', () => {
        const id = 'testId';
        const name = 'testName';
        const tiles: Tile[] = [
            { letter: 'A', value: 10 },
            { letter: 'B', value: 10 },
        ];
        const player = new Player(id, name, tiles);
        // eslint-disable-next-line dot-notation
        expect(player['tiles'] === player.getTiles()).toBeFalsy();
    });

    playerDataTestCases.forEach((testCase: PlayerData) => {
        it('Update data should actualize player data', () => {
            const initId = 'testId1';
            const initName = 'testName1';
            const initTiles: Tile[] = [];
            const player = new Player(initId, initName, initTiles);
            player.updatePlayerData(testCase);

            if (testCase.newId) {
                expect(player.id).toEqual(testCase.newId);
            } else {
                expect(player.id).toEqual(initId);
            }

            if (testCase.name) {
                expect(player.name).toEqual(testCase.name);
            } else {
                expect(player.name).toEqual(initName);
            }

            if (testCase.score) {
                expect(player.score).toEqual(testCase.score);
            } else {
                expect(player.score).toEqual(0);
            }

            if (testCase.tiles) {
                expect(player.getTiles()).toEqual(testCase.tiles);
                expect(player['tiles'] === testCase.tiles).toBeFalsy();
            } else {
                expect(player.getTiles()).toEqual(initTiles);
            }
        });
    });
});
