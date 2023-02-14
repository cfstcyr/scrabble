import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrivateRouteGuard } from '@app/guard/private-route/private-route.guard';
import { PublicRouteGuard } from '@app/guard/public-route/public-route.guard';
import { AdminPageComponent } from '@app/pages/admin-page/admin-page.component';
import { CreateWaitingPageComponent } from '@app/pages/create-waiting-page/create-waiting-page.component';
import { GameCreationPageComponent } from '@app/pages/game-creation-page/game-creation-page.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { HighScoresPageComponent } from '@app/pages/high-scores-page/high-scores-page.component';
import { HomePageComponent } from '@app/pages/home-page/home-page.component';
import { JoinWaitingPageComponent } from '@app/pages/join-waiting-page/join-waiting-page.component';
import { LobbyPageComponent } from '@app/pages/lobby-page/lobby-page.component';
import { LoginPageComponent } from '@app/pages/login-page/login-page.component';
import { SignUpPageComponent } from '@app/pages/signup-page/signup-page.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'signup', component: SignUpPageComponent, canActivate: [PublicRouteGuard] },
    { path: 'login', component: LoginPageComponent, canActivate: [PublicRouteGuard] },
    { path: 'home', component: HomePageComponent, canActivate: [PrivateRouteGuard] },
    { path: 'game', component: GamePageComponent, canActivate: [PrivateRouteGuard] },
    { path: 'game-creation', component: GameCreationPageComponent, canActivate: [PrivateRouteGuard] },
    { path: 'lobby', component: LobbyPageComponent, canActivate: [PrivateRouteGuard] },
    { path: 'waiting-room', component: CreateWaitingPageComponent, canActivate: [PrivateRouteGuard] },
    { path: 'join-waiting-room', component: JoinWaitingPageComponent, canActivate: [PrivateRouteGuard] },
    { path: 'high-scores', component: HighScoresPageComponent, canActivate: [PrivateRouteGuard] },
    { path: 'admin', component: AdminPageComponent, canActivate: [PrivateRouteGuard] },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
