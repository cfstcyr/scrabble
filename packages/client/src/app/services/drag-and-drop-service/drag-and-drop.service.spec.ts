/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-empty-function */
import { CdkDragMove } from '@angular/cdk/drag-drop';
import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Position } from '@app/classes/board-navigator/position';
import { TilePlacement } from '@app/classes/tile';
import { TilePlacementService } from '@app/services/tile-placement-service/tile-placement.service';
import { GameHistoryForUser } from '@common/models/game-history';
import { PublicServerAction } from '@common/models/server-action';
import { PublicUser } from '@common/models/user';
import { PublicUserStatistics } from '@common/models/user-statistics';
import { BehaviorSubject } from 'rxjs';
import { UserService } from '@app/services/user-service/user.service';
import { DragAndDropService } from './drag-and-drop.service';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import BoardService from '@app/services/board-service/board.service';
import RoundManagerService from '@app/services/round-manager-service/round-manager.service';

const DEFAULT_PLACEMENT: TilePlacement = {
    position: { row: 0, column: 0 },
    tile: { letter: 'A', value: 1 },
};
const DEFAULT_EVENT: CdkDragMove<HTMLElement> = {
    pointerPosition: { x: 0, y: 0 },
} as CdkDragMove<HTMLElement>;

const createSquare = (document: Document, position: Position = DEFAULT_PLACEMENT.position) => {
    const square = document.createElement('div');
    square.classList.add('square');
    square.setAttribute('column', `${position.column}`);
    square.setAttribute('row', `${position.row}`);
    return square;
};

class MockBoardService {
    isLocalPlayer(): boolean {
        return false;
    }
}

class MockRoundManager {
    isActivePlayerLocalPlayer(): boolean {
        return true;
    }
}

describe('DragAndDropService', () => {
    let service: DragAndDropService;
    let mockBoardService;
    let mockRoundManager;
    let tilePlacementServiceSpy: TilePlacementService;
    let document: Document;
    const userService = jasmine.createSpyObj(UserService, ['updateStatistics', 'updateGameHistory', 'updateServerActions']);
    userService.user = new BehaviorSubject<PublicUser>({ email: '1@2', avatar: '', username: 'John Doe' });
    userService.statistics = new BehaviorSubject<PublicUserStatistics>({
        gamesPlayedCount: 1,
        gamesWonCount: 1,
        averageTimePerGame: 1,
        averagePointsPerGame: 1,
    });
    userService.gameHistory = new BehaviorSubject<GameHistoryForUser[]>([]);
    userService.serverActions = new BehaviorSubject<PublicServerAction[]>([]);

    beforeEach(() => {
        mockBoardService = new MockBoardService();
        mockRoundManager = new MockRoundManager();
        tilePlacementServiceSpy = new TilePlacementService(
            mockBoardService as unknown as BoardService,
            {} as unknown as MatDialog,
            mockRoundManager as unknown as RoundManagerService,
        );
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatDialogModule, HttpClientModule, HttpClientTestingModule, RouterTestingModule],
            providers: [
                { provide: UserService, useValue: userService },
                { provide: TilePlacementService, useValue: tilePlacementServiceSpy },
            ],
        });
        service = TestBed.inject(DragAndDropService);
        // tilePlacementServiceSpy = TestBed.inject(TilePlacementService);
        document = TestBed.inject(DOCUMENT);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('onRackTileDrop', () => {
        it('should add tile to tilePlacements if is square', () => {
            const square = createSquare(document);
            spyOn(document, 'elementFromPoint').and.returnValue(square);

            service.onRackTileMove(DEFAULT_EVENT);
            service.onRackTileDrop(DEFAULT_PLACEMENT.tile);

            expect(tilePlacementServiceSpy.tilePlacements).toHaveSize(1);
        });

        it('should not add tile to tilePlacements if is not square', () => {
            const square = document.createElement('div');
            spyOn(document, 'elementFromPoint').and.returnValue(square);

            service.onRackTileMove(DEFAULT_EVENT);
            service.onRackTileDrop(DEFAULT_PLACEMENT.tile);

            expect(tilePlacementServiceSpy.tilePlacements).toHaveSize(0);
        });
    });

    describe('onBoardTileDrop', () => {
        let newPosition: Position;

        beforeEach(() => {
            newPosition = { row: 1, column: 1 };
        });

        it('should move tile if is square', () => {
            const square = createSquare(document, newPosition);
            spyOn(document, 'elementFromPoint').and.returnValue(square);

            tilePlacementServiceSpy.placeTile(DEFAULT_PLACEMENT);

            service.onBoardTileMove(DEFAULT_EVENT);
            service.onBoardTileDrop(DEFAULT_PLACEMENT.tile, DEFAULT_PLACEMENT.position);

            expect(
                tilePlacementServiceSpy.tilePlacements.find(
                    (placement: TilePlacement) => placement.position.column === newPosition.column && placement.position.row === newPosition.row,
                ),
            ).toBeTruthy();
            expect(
                tilePlacementServiceSpy.tilePlacements.find(
                    (placement: TilePlacement) =>
                        placement.position.column === DEFAULT_PLACEMENT.position.column && placement.position.row === DEFAULT_PLACEMENT.position.row,
                ),
            ).toBeFalsy();
        });

        it('should not move tile if is not square', () => {
            const square = document.createElement('div');
            spyOn(document, 'elementFromPoint').and.returnValue(square);

            tilePlacementServiceSpy.placeTile(DEFAULT_PLACEMENT);

            service.onBoardTileMove(DEFAULT_EVENT);
            service.onBoardTileDrop(DEFAULT_PLACEMENT.tile, DEFAULT_PLACEMENT.position);

            expect(
                tilePlacementServiceSpy.tilePlacements.find(
                    (placement: TilePlacement) => placement.position.column === newPosition.column && placement.position.row === newPosition.row,
                ),
            ).toBeFalsy();
            expect(
                tilePlacementServiceSpy.tilePlacements.find(
                    (placement: TilePlacement) =>
                        placement.position.column === DEFAULT_PLACEMENT.position.column && placement.position.row === DEFAULT_PLACEMENT.position.row,
                ),
            ).toBeTruthy();
        });

        it('should remove tile from tilePlacements if is tileRack', () => {
            const tileRack = document.createElement('div');
            tileRack.classList.add('tile-rack');
            spyOn(document, 'elementFromPoint').and.returnValue(tileRack);

            tilePlacementServiceSpy.placeTile(DEFAULT_PLACEMENT);

            service.onBoardTileMove(DEFAULT_EVENT);
            service.onBoardTileDrop(DEFAULT_PLACEMENT.tile, DEFAULT_PLACEMENT.position);

            expect(tilePlacementServiceSpy.tilePlacements).toHaveSize(0);
        });
    });
});
