import { NgModule } from '@angular/core';
import { Route, RouterModule, Routes } from '@angular/router';
import { PrivateRouteGuard } from '@app/guard/private-route/private-route.guard';
import { PublicRouteGuard } from '@app/guard/public-route/public-route.guard';
import { CreateWaitingPageComponent } from '@app/pages/create-waiting-page/create-waiting-page.component';
import { GameCreationPageComponent } from '@app/pages/game-creation-page/game-creation-page.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { HomePageComponent } from '@app/pages/home-page/home-page.component';
import { JoinWaitingPageComponent } from '@app/pages/join-waiting-page/join-waiting-page.component';
import { GroupsPageComponent } from '@app/pages/groups-page/groups-page.component';
import { LoginPageComponent } from '@app/pages/login-page/login-page.component';
import { SignUpPageComponent } from '@app/pages/signup-page/signup-page.component';
import { UserProfilePageComponent } from '@app/pages/user-profile-page/user-profile-page.component';
import {
    ROUTE_CREATE_WAITING,
    ROUTE_GAME,
    ROUTE_GAME_CREATION,
    ROUTE_GROUPS,
    ROUTE_HOME,
    ROUTE_JOIN_WAITING,
    ROUTE_LOGIN,
    ROUTE_PROFILE,
    ROUTE_SIGNUP,
} from '@app/constants/routes-constants';

const privateRoute: Route = {
    canActivate: [PrivateRouteGuard],
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
};

const publicRoute: Route = {
    canActivate: [PublicRouteGuard],
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
};

const removeStartSlash = (str: string) => (str.startsWith('/') ? str.substring(1) : str);

const routes: Routes = [
    { path: '', redirectTo: ROUTE_HOME, pathMatch: 'full' },
    { path: ROUTE_SIGNUP, component: SignUpPageComponent, ...publicRoute },
    { path: ROUTE_LOGIN, component: LoginPageComponent, ...publicRoute },
    { path: ROUTE_HOME, component: HomePageComponent, ...privateRoute },
    { path: ROUTE_GAME, component: GamePageComponent, ...privateRoute },
    { path: ROUTE_GAME_CREATION, component: GameCreationPageComponent, ...privateRoute },
    { path: ROUTE_GROUPS, component: GroupsPageComponent, ...privateRoute },
    { path: ROUTE_CREATE_WAITING, component: CreateWaitingPageComponent, ...privateRoute },
    { path: ROUTE_JOIN_WAITING, component: JoinWaitingPageComponent, ...privateRoute },
    { path: ROUTE_PROFILE, component: UserProfilePageComponent, ...privateRoute },
    { path: '**', redirectTo: ROUTE_HOME },
].map((route) => ({ ...route, path: removeStartSlash(route.path) }));

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
