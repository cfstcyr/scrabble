import { Injectable } from '@angular/core';
import { PublicUser } from '@common/models/user';

@Injectable({
    providedIn: 'root',
})
export class UserService {
    user: PublicUser;

    constructor() {
        // TODO: user real user
        this.user = {
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            username: `User ${Math.floor(Math.random() * 1000)}`,
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            avatar: `https://placedog.net/${Math.floor(Math.random() * 20 + 50)}`,
        };
    }

    isUser(u: PublicUser | string) {
        return (typeof u === 'string' ? u : u.username) === this.user.username;
    }
}
