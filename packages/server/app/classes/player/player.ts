import { PlayerData } from '@app/classes/communication/player-data';
import { AbstractObjective } from '@app/classes/objectives/abstract-objective/abstract-objective';
import { ObjectiveUpdate } from '@app/classes/objectives/objective-utils';
import { ObjectiveValidationParameters } from '@app/classes/objectives/validation-parameters';
import { Tile } from '@app/classes/tile';
import ObjectivesService from '@app/services/objective-service/objective.service';
import { Container } from 'typedi';

export default class Player {
    name: string;
    score: number;
    tiles: Tile[];
    id: string;
    isConnected: boolean;
    private objectives: AbstractObjective[];
    private readonly objectiveService: ObjectivesService;

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
        this.score = 0;
        this.tiles = [];
        this.isConnected = true;
        this.objectiveService = Container.get(ObjectivesService);
    }

    getTileRackPoints(): number {
        return this.tiles.reduce((prev, next) => prev + next.value, 0);
    }

    hasTilesLeft(): boolean {
        return this.tiles.length > 0;
    }

    endGameMessage(): string {
        return `${this.name} : ${this.tilesToString()}`;
    }

    getObjectives(): AbstractObjective[] {
        return [...this.objectives];
    }

    resetObjectivesProgression(): void {
        [...this.objectives]
            .filter((objective: AbstractObjective) => !objective.isCompleted() && objective.shouldResetOnInvalidWord)
            .forEach((objective: AbstractObjective) => {
                objective.progress = 0;
            });
    }

    initializeObjectives(publicObjectives: Set<AbstractObjective>, privateObjective: AbstractObjective): void {
        const publicObjectiveClones: AbstractObjective[] = [...publicObjectives.values()].map((objective: AbstractObjective) => objective.clone());
        this.objectives = [...publicObjectiveClones, privateObjective];
    }

    validateObjectives(validationParameters: ObjectiveValidationParameters): ObjectiveUpdate | undefined {
        return this.objectiveService.validatePlayerObjectives(this, validationParameters.game, validationParameters);
    }

    copyPlayerInfo(oldPlayer: Player): PlayerData {
        this.score = oldPlayer.score;
        this.tiles = oldPlayer.tiles;
        this.objectives = oldPlayer.objectives;
        return { id: oldPlayer.id, newId: this.id, name: this.name };
    }

    convertToPlayerData(): PlayerData {
        return { id: this.id, name: this.name, score: this.score, tiles: this.tiles, isConnected: this.isConnected, objectives: this.objectives };
    }

    private tilesToString(): string {
        return this.tiles.reduce((prev, next) => prev + next.letter.toLocaleLowerCase(), '');
    }
}
