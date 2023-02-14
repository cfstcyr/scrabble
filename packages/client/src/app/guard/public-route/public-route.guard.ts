import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { UserService } from '@app/services/user-service/user.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class PublicRouteGuard implements CanActivate {
    constructor(private readonly userService: UserService, private readonly router: Router) {}

    canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        return this.userService.isConnected().pipe(
            map((isConnected) => {
                if (!isConnected) return true;
                this.router.navigate(['/home']);
                return false;
            }),
        );
    }
}
