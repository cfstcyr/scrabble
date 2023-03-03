import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PublicUser, UNKOWN_USER } from '@common/models/user';

@Component({
    selector: 'app-requesting-user-container',
    templateUrl: './requesting-user-container.component.html',
    styleUrls: ['./requesting-user-container.component.scss'],
})
export class RequestingUserContainerComponent {
    @Input() requestingUser: PublicUser;
    @Input() isGroupFull: boolean;
    @Output() acceptedUser: EventEmitter<PublicUser>;
    @Output() rejectedUser: EventEmitter<PublicUser>;

    constructor() {
        this.acceptedUser = new EventEmitter<PublicUser>();
        this.rejectedUser = new EventEmitter<PublicUser>();
        this.requestingUser = UNKOWN_USER;
    }
    accept(): void {
        this.acceptedUser.emit(this.requestingUser);
    }

    reject(): void {
        this.rejectedUser.emit(this.requestingUser);
    }
}
