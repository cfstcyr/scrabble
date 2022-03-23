import Player from '@app/classes/player/player';
import { VIRTUAL_PLAYER_ID_PREFIX } from '@app/constants/virtual-player-constants';
import { ActiveGameService } from '@app/services/active-game-service/active-game.service';
import WordFindingService from '@app/services/word-finding-service/word-finding.service';
import { Container } from 'typedi';
import { v4 as uuidv4 } from 'uuid';
import Range from '@app/classes/range/range';
import { VirtualPlayerService } from '@app/services/virtual-player-service/virtual-player.service';

export abstract class AbstractVirtualPlayer extends Player {
    gameId: string;
    pointHistory: Map<number, number>;

    private wordFindingService: WordFindingService;
    private activeGameService: ActiveGameService;
    private virtualPlayerService: VirtualPlayerService;
    constructor(gameId: string, name: string) {
        super(VIRTUAL_PLAYER_ID_PREFIX + uuidv4(), name);
        this.pointHistory = new Map<number, number>();
        this.gameId = gameId;
        this.wordFindingService = Container.get(WordFindingService);
        this.activeGameService = Container.get(ActiveGameService);
        this.virtualPlayerService = Container.get(VirtualPlayerService);
    }

    getVirtualPlayerService(): VirtualPlayerService {
        return this.virtualPlayerService;
    }

    getWordFindingService(): WordFindingService {
        return this.wordFindingService;
    }

    getActiveGameService(): ActiveGameService {
        return this.activeGameService;
    }

    abstract playTurn(): void;

    protected abstract findAction(): void;

    protected abstract findPointRange(): Range;
}
