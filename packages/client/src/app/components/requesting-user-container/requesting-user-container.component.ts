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
    @Input() isObserver: boolean;
    @Output() acceptedUser: EventEmitter<[PublicUser, boolean]>;
    @Output() rejectedUser: EventEmitter<[PublicUser, boolean]>;

    constructor() {
        this.acceptedUser = new EventEmitter<[PublicUser, boolean]>();
        this.rejectedUser = new EventEmitter<[PublicUser, boolean]>();
        this.requestingUser = UNKOWN_USER;
    }
    accept(): void {
        this.acceptedUser.emit([this.requestingUser, this.isObserver]);
    }

    reject(): void {
        this.rejectedUser.emit([this.requestingUser, this.isObserver]);
    }
}
