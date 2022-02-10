import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LobbyInfo } from '@app/classes/communication/lobby-info';
import { GameType } from '@app/classes/game-type';
import { Timer } from '@app/classes/timer';

@Component({
    selector: 'app-lobby-info',
    templateUrl: './lobby-info.component.html',
    styleUrls: ['./lobby-info.component.scss'],
})
export class LobbyInfoComponent implements OnInit {
    @Input() lobby: LobbyInfo;
    @Output() joinLobbyId = new EventEmitter<string>();
    roundTime: Timer;
    // dictionnaries: Dictionnaries[]

    constructor() {
        this.lobby = { lobbyId: '0', dictionary: '', playerName: '', gameType: GameType.Classic, maxRoundTime: 0, canJoin: false };
        this.roundTime = Timer.convertTime(this.lobby.maxRoundTime);
    }

    ngOnInit() {
        this.roundTime = Timer.convertTime(this.lobby.maxRoundTime);
    }

    joinLobby() {
        this.joinLobbyId.emit(this.lobby.lobbyId);
    }
}
