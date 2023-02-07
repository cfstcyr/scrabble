import { Injectable } from '@angular/core';
import { AuthenticationController } from '@app/controllers/authentication-controller/authentication.controller';
import { authenticationSettings } from '@app/utils/settings';
import { Credentials, PublicUser, UserSession } from '@common/models/user';
import { ErrorResponse } from '@common/models/error';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class AuthenticationService {
    private user: PublicUser | undefined;

    constructor(private readonly authenticationController: AuthenticationController) {}

    getUser(): PublicUser {
        if (!this.user) throw new Error('You need to be logged in to perform this action');
        return this.user;
    }

    login(credentials: Credentials): Observable<UserSession> {
        return this.authenticationController.login(credentials).pipe(
            tap(this.handleUserSession.bind(this)),
            catchError((err: ErrorResponse) => {
                throw new Error(err.message);
            }),
        );
    }

    signup(credentials: Credentials): Observable<UserSession> {
        return this.authenticationController.signup(credentials).pipe(
            tap(this.handleUserSession.bind(this)),
            catchError((err: ErrorResponse) => {
                throw new Error(err.message);
            }),
        );
    }

    signOut(): void {
        authenticationSettings.remove('token');
        this.user = undefined;
    }

    validateToken(): Observable<boolean> {
        const token = authenticationSettings.getToken();

        if (!token) return of(false);

        return this.authenticationController.validateToken(token).pipe(
            map((session) => {
                this.handleUserSession(session);
                return true;
            }),
            catchError(() => {
                return of(false);
            }),
        );
    }

    private handleUserSession(session: UserSession): void {
        authenticationSettings.setToken(session.token);
        this.user = session.user;
    }
}
