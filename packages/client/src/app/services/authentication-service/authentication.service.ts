import { Injectable } from '@angular/core';
import { AuthenticationController } from '@app/controllers/authentication-controller/authentication.controller';
import { authenticationSettings } from '@app/utils/settings';
import { UserLoginCredentials, UserSession, UserSignupInformation } from '@common/models/user';
import { ErrorResponse } from '@common/models/error';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { HttpStatusCode } from '@angular/common/http';
import SocketService from '@app/services/socket-service/socket.service';
import { UserService } from '@app/services/user-service/user.service';

@Injectable({
    providedIn: 'root',
})
export class AuthenticationService {
    constructor(
        private readonly authenticationController: AuthenticationController,
        private readonly userService: UserService,
        private readonly socketService: SocketService,
    ) {
        this.socketService.socketError.subscribe(this.handleSocketError.bind(this));
    }

    login(credentials: UserLoginCredentials): Observable<UserSession> {
        return this.authenticationController.login(credentials).pipe(
            tap(this.handleUserSession.bind(this)),
            catchError((err: ErrorResponse) => {
                throw new Error(err.message);
            }),
        );
    }

    signup(credentials: UserSignupInformation): Observable<UserSession> {
        return this.authenticationController.signup(credentials).pipe(
            tap(this.handleUserSession.bind(this)),
            catchError((err: ErrorResponse) => {
                throw new Error(err.message);
            }),
        );
    }

    signOut(): void {
        authenticationSettings.remove('token');
        this.socketService.disconnect();
        this.userService.user.next(undefined);
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

    validateUsername(username: string): Observable<boolean> {
        return this.authenticationController.validateUsername(username).pipe(map((res) => res.isAvailable));
    }

    validateEmail(email: string): Observable<boolean> {
        return this.authenticationController.validateEmail(email).pipe(map((res) => res.isAvailable));
    }

    private handleUserSession(session: UserSession): void {
        authenticationSettings.setToken(session.token);
        this.userService.user.next(session.user);
        this.socketService.connectSocket();
    }

    private handleSocketError({ code }: { message: string; code: number }): void {
        if (code === HttpStatusCode.Unauthorized) {
            this.signOut();
        }
    }
}
