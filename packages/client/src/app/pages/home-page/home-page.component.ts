import { Component } from '@angular/core';
import { ROUTE_GAME_CREATION, ROUTE_GROUPS } from '@app/constants/routes-constants';

@Component({
    selector: 'app-home-page',
    templateUrl: './home-page.component.html',
    styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent {
    routeGroups = ROUTE_GROUPS;
    routeGameCreation = ROUTE_GAME_CREATION;
}
