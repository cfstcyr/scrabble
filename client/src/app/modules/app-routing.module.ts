import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateWaitingPageComponent } from '@app/pages/create-waiting-page/create-waiting-page.component';
import { GameCreationPageComponent } from '@app/pages/game-creation-page/game-creation-page.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { HomePageComponent } from '@app/pages/home-page/home-page.component';
import { JoinWaitingPageComponent } from '@app/pages/join-waiting-page/join-waiting-page.component';
import { LobbyPageComponent } from '@app/pages/lobby-page/lobby-page.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: HomePageComponent },
    { path: 'game', component: GamePageComponent },
    { path: 'game-creation', component: GameCreationPageComponent },
    { path: 'lobby', component: LobbyPageComponent },
    { path: 'waiting-room', component: CreateWaitingPageComponent },
    { path: 'join-waiting', component: JoinWaitingPageComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
