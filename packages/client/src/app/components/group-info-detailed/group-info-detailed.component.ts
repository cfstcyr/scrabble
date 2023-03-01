import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GameVisibility } from '@common/models/game-visibility';
import { Group } from '@common/models/group';
import { UNKOWN_USER } from '@common/models/user';
import { VirtualPlayerLevel } from '@common/models/virtual-player-level';
@Component({
    selector: 'app-group-info-detailed',
    templateUrl: './group-info-detailed.component.html',
    styleUrls: ['./group-info-detailed.component.scss'],
})
export class GroupInfoDetailedComponent {
    @Input() group: Group;
    @Input() isHost: boolean;
    @Input() isGroupEmpty: boolean;
    @Input() roundTime: string;
    @Output() startGame: EventEmitter<void>;
    gameVisibilities = GameVisibility;

    constructor() {
        this.group = {
            groupId: '0',
            user1: UNKOWN_USER,
            maxRoundTime: 0,
            gameVisibility: GameVisibility.Public,
            virtualPlayerLevel: VirtualPlayerLevel.Beginner,
        };
    }

    start(): void {
        this.startGame.emit();
    }
}
