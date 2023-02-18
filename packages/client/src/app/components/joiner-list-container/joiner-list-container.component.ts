import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-joiner-list-container',
    templateUrl: './joiner-list-container.component.html',
    styleUrls: ['./joiner-list-container.component.scss'],
})
export class JoinerListContainerComponent {
    @Input() playerName: string;
    @Output() acceptPlayerId: EventEmitter<string>;
    @Output() refusePlayerId: EventEmitter<string>;

    constructor() {
        this.acceptPlayerId = new EventEmitter<string>();
        this.refusePlayerId = new EventEmitter<string>();
        this.playerName = '';
    }
    accept(): void {
        this.acceptPlayerId.emit(this.playerName);
    }

    reject(): void {
        this.refusePlayerId.emit(this.playerName);
    }
}
