import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractController } from '@app/controllers/abstract-controller';
import { Credentials, UserSession } from '@common/models/user';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AuthenticationController extends AbstractController {
    constructor(private readonly http: HttpClient) {
        super('/authenticate');
    }

    login(credentials: Credentials): Observable<UserSession> {
        return this.http.post<UserSession>(this.url('/login'), credentials);
    }

    signup(credentials: Credentials): Observable<UserSession> {
        return this.http.post<UserSession>(this.url('/signup'), credentials);
    }

    validateToken(token: string): Observable<UserSession> {
        return this.http.post<UserSession>(this.url('/validateToken'), { token });
    }
}
