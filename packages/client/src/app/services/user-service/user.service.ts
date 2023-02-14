import { Injectable } from '@angular/core';
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
        return this.user.pipe(map((user) => !!user));
    }

    getUser(): PublicUser {
        if (!this.user.value) throw new Error('You need to be logged in to perform this action');
        return this.user.value;
    }

    isUser(u: PublicUser | string) {
        return (typeof u === 'string' ? u : u.username) === this.user.value?.username;
    }
}
