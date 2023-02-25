import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Timer } from '@app/classes/round/timer';
import { GameVisibility } from '@common/models/game-visibility';
import GroupInfo from '@common/models/group-info';
import { VirtualPlayerLevel } from '@common/models/virtual-player-level';
@Component({
    selector: 'app-group-info',
    templateUrl: './group-info.component.html',
    styleUrls: ['./group-info.component.scss'],
})
export class GroupInfoComponent implements OnInit {
    @Input() group: GroupInfo;
    @Output() joinGroupId: EventEmitter<string>;
    roundTime: Timer;

    constructor() {
        this.joinGroupId = new EventEmitter<string>();
        this.group = {
            groupId: '0',
            hostName: '',
            maxRoundTime: 0,
            gameVisibility: GameVisibility.Public,
            virtualPlayerLever: VirtualPlayerLevel.Beginner,
            canJoin: false,
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
