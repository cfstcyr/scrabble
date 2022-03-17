import { Board, BoardNavigator, Orientation, Position } from '@app/classes/board';
import { LetterValue } from '@app/classes/tile';
import Direction from '@app/classes/board/direction';

export interface PlacementWithDistance {
    distance: number;
}
export interface LetterPosition extends PlacementWithDistance {
    letter: LetterValue;
}
export interface PerpendicularLettersPosition extends PlacementWithDistance {
    before: LetterValue[];
    after: LetterValue[];
}
export interface LinePlacements {
    letters: LetterPosition[];
    perpendicularLetters: PerpendicularLettersPosition[];
}
export interface BoardPlacement {
    letters: LetterPosition[];
    perpendicularLetters: PerpendicularLettersPosition[];
    position: Position;
    orientation: Orientation;
    maxSize: number;
    minSize: number;
}

const PREVIOUS_EXISTS = -1;
const SHOULD_BE_FILLED = true;

export default class BoardPlacementsExtractor {
    private navigator: BoardNavigator;
    private board: Board;

    constructor(board: Board) {
        this.board = board;
        this.navigator = new BoardNavigator(board, new Position(0, 0), Orientation.Horizontal);
    }

    extractBoardPlacements(): BoardPlacement[] {
        const orientations = [Orientation.Horizontal, Orientation.Vertical];
        let positions: BoardPlacement[] = [];

        for (const orientation of orientations) {
            this.navigator.position = new Position(0, 0);
            this.navigator.orientation = orientation;

            do {
                const lineExtraction = this.extractBoardPlacementFromLine(this.navigator);
                positions = positions.concat(lineExtraction);
                this.navigator.nextLine();
            } while (this.navigator.isWithinBounds());
        }

        return positions;
    }

    private extractBoardPlacementFromLine(navigator: BoardNavigator): BoardPlacement[] {
        const boardPlacements: BoardPlacement[] = [];

        navigator = navigator.clone();

        const linePlacements = this.extractLinePlacements(navigator);

        for (const distance of this.moveThroughLine(navigator)) {
            const adjustedLinePlacements = this.adjustLinePlacements(linePlacements, distance);

            if (adjustedLinePlacements) {
                const boardPlacement: BoardPlacement = {
                    letters: adjustedLinePlacements.letters,
                    perpendicularLetters: adjustedLinePlacements.perpendicularLetters,
                    position: navigator.position.copy(),
                    orientation: navigator.orientation,
                    maxSize: this.getSize(navigator.orientation) - distance,
                    minSize: this.getMinSize(adjustedLinePlacements),
                };

                if (this.isValidBoardPlacement(boardPlacement)) boardPlacements.push(boardPlacement);
            }
        }

        return boardPlacements;
    }

    private extractLinePlacements(navigator: BoardNavigator): LinePlacements {
        const result: LinePlacements = {
            letters: [],
            perpendicularLetters: [],
        };

        navigator = navigator.clone();

        for (const distance of this.moveThroughLine(navigator)) {
            if (navigator.square.tile)
                result.letters.push({
                    letter: navigator.square.tile.letter,
                    distance,
                });
            else if (navigator.verifyPerpendicularNeighbors(SHOULD_BE_FILLED))
                result.perpendicularLetters.push({
                    before: this.getPerpendicularLetters(navigator.clone().switchOrientation(), Direction.Backward).reverse(),
                    after: this.getPerpendicularLetters(navigator.clone().switchOrientation(), Direction.Forward),
                    distance,
                });
        }

        return result;
    }

    private adjustLinePlacements(linePlacements: LinePlacements, distance: number): LinePlacements | undefined {
        let letters = this.adjustDistances(linePlacements.letters, distance);
        let perpendicularLetters = this.adjustDistances(linePlacements.perpendicularLetters, distance);

        if (letters.some((lp) => lp.distance === PREVIOUS_EXISTS)) return undefined;

        letters = letters.filter((letter) => letter.distance >= 0);
        perpendicularLetters = perpendicularLetters.filter((letter) => letter.distance >= 0);

        if (letters.length > 0 || perpendicularLetters.length > 0) return { letters, perpendicularLetters };
        else return undefined;
    }

    private getPerpendicularLetters(navigator: BoardNavigator, direction: Direction): LetterValue[] {
        navigator = navigator.clone();
        const letters: LetterValue[] = [];
        while (navigator.move(direction) && navigator.isWithinBounds() && navigator.square.tile) letters.push(navigator.square.tile.letter);
        return letters;
    }

    private adjustDistances<T extends PlacementWithDistance>(placements: T[], distance: number): T[] {
        return placements.map((placement) => ({ ...placement, distance: placement.distance - distance }));
    }

    private getSize(orientation: Orientation): number {
        return orientation === Orientation.Horizontal ? this.board.getSize().x : this.board.getSize().y;
    }

    private getMinSize(linePlacement: LinePlacements): number {
        return Math.min(
            linePlacement.letters.find(() => true)?.distance ?? Number.POSITIVE_INFINITY,
            linePlacement.perpendicularLetters.find(() => true)?.distance ?? Number.POSITIVE_INFINITY,
        );
    }

    private isValidBoardPlacement(boardPlacement: BoardPlacement): boolean {
        return boardPlacement.maxSize > boardPlacement.letters.length;
    }

    private *moveThroughLine(navigator: BoardNavigator): Generator<number> {
        let distance = 0;
        while (navigator.isWithinBounds()) {
            yield distance;
            distance++;
            navigator.forward();
        }
    }
}
