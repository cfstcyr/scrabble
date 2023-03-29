import { Component } from '@angular/core';
import { LOGO } from '@app/constants/app-constants';
import { ROUTE_GAME_CREATION, ROUTE_GROUPS, ROUTE_PUZZLE } from '@app/constants/routes-constants';

@Component({
    selector: 'app-home-page',
    templateUrl: './home-page.component.html',
    styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent {
    routeGroups = ROUTE_GROUPS;
    routeGameCreation = ROUTE_GAME_CREATION;
    routePuzzle = ROUTE_PUZZLE;
    logo = LOGO;
}
