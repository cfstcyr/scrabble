import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminPageComponent } from '@app/pages/admin-page/admin-page.component';
import { CreateWaitingPageComponent } from '@app/pages/create-waiting-page/create-waiting-page.component';
import { GameCreationPageComponent } from '@app/pages/game-creation-page/game-creation-page.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { HighScoresPageComponent } from '@app/pages/high-scores-page/high-scores-page.component';
import { HomePageComponent } from '@app/pages/home-page/home-page.component';
import { JoinWaitingPageComponent } from '@app/pages/join-waiting-page/join-waiting-page.component';
import { LobbyPageComponent } from '@app/pages/lobby-page/lobby-page.component';
import { SignUpPageComponent } from '@app/pages/signin-page/signup-page.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'signup', component: SignUpPageComponent },
    { path: 'home', component: HomePageComponent },
    { path: 'game', component: GamePageComponent },
    { path: 'game-creation', component: GameCreationPageComponent },
    { path: 'lobby', component: LobbyPageComponent },
    { path: 'waiting-room', component: CreateWaitingPageComponent },
    { path: 'join-waiting-room', component: JoinWaitingPageComponent },
    { path: 'high-scores', component: HighScoresPageComponent },
    { path: 'admin', component: AdminPageComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
