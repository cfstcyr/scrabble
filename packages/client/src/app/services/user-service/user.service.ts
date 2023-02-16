import { Injectable } from '@angular/core';
import { LOGIN_REQUIRED } from '@app/constants/services-errors';
import { PublicUser } from '@common/models/user';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class UserService {
    user: BehaviorSubject<PublicUser | undefined>;

    constructor() {
        this.user = new BehaviorSubject<PublicUser | undefined>(undefined);
    }

    isConnected(): Observable<boolean> {
        return this.user.pipe(map((user) => Boolean(user)));
    }

    getUser(): PublicUser {
        if (!this.user.value) throw new Error(LOGIN_REQUIRED);
        return this.user.value;
    }

    isUser(u: PublicUser | string) {
        return (typeof u === 'string' ? u : u.username) === this.user.value?.username;
    }
}
