import { NgModule } from '@angular/core';
import { Route, RouterModule, Routes } from '@angular/router';
import { PrivateRouteGuard } from '@app/guard/private-route/private-route.guard';
import { PublicRouteGuard } from '@app/guard/public-route/public-route.guard';
import { CreateWaitingPageComponent } from '@app/pages/create-waiting-page/create-waiting-page.component';
import { GameCreationPageComponent } from '@app/pages/game-creation-page/game-creation-page.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { HighScoresPageComponent } from '@app/pages/high-scores-page/high-scores-page.component';
import { HomePageComponent } from '@app/pages/home-page/home-page.component';
import { JoinWaitingPageComponent } from '@app/pages/join-waiting-page/join-waiting-page.component';
import { GroupPageComponent } from '@app/pages/group-page/group-page.component';
import { LoginPageComponent } from '@app/pages/login-page/login-page.component';
import { SignUpPageComponent } from '@app/pages/signup-page/signup-page.component';

const privateRoute: Route = {
    canActivate: [PrivateRouteGuard],
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
};

const publicRoute: Route = {
    canActivate: [PublicRouteGuard],
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
};

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'signup', component: SignUpPageComponent, ...publicRoute },
    { path: 'login', component: LoginPageComponent, ...publicRoute },
    { path: 'home', component: HomePageComponent, ...privateRoute },
    { path: 'game', component: GamePageComponent, ...privateRoute },
    { path: 'game-creation', component: GameCreationPageComponent, ...privateRoute },
    { path: 'group', component: GroupPageComponent, ...privateRoute },
    { path: 'waiting-room', component: CreateWaitingPageComponent, ...privateRoute },
    { path: 'join-waiting-room', component: JoinWaitingPageComponent, ...privateRoute },
    { path: 'high-scores', component: HighScoresPageComponent, ...privateRoute },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
