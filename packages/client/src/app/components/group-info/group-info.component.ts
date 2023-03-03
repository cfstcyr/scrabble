import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Timer } from '@app/classes/round/timer';
import { GameVisibility } from '@common/models/game-visibility';
import { Group } from '@common/models/group';
import { UNKOWN_USER } from '@common/models/user';
import { VirtualPlayerLevel } from '@common/models/virtual-player-level';
@Component({
    selector: 'app-group-info',
    templateUrl: './group-info.component.html',
    styleUrls: ['./group-info.component.scss'],
})
export class GroupInfoComponent implements OnInit {
    @Input() group: Group;
    @Output() joinGroupId: EventEmitter<string>;
    roundTime: Timer;
    gameVisibilities = GameVisibility;

    constructor() {
        this.joinGroupId = new EventEmitter<string>();
        this.group = {
            groupId: '0',
            password: '',
            user1: UNKOWN_USER,
            maxRoundTime: 0,
            gameVisibility: GameVisibility.Public,
            virtualPlayerLevel: VirtualPlayerLevel.Beginner,
        };
        this.roundTime = Timer.convertTime(this.group.maxRoundTime);
    }

    ngOnInit(): void {
        this.roundTime = Timer.convertTime(this.group.maxRoundTime);
    }

    joinGroup(): void {
        this.joinGroupId.emit(this.group.groupId);
    }
}
