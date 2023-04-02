import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ColorThemeDialogComponent } from '@app/components/color-theme-dialog/color-theme-dialog';
import { LOGO } from '@app/constants/app-constants';
import { ROUTE_GAME_CREATION, ROUTE_GROUPS, ROUTE_PUZZLE } from '@app/constants/routes-constants';
// import { setTheme } from '@angular/material';

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
    constructor(private readonly dialog: MatDialog) {}
    openColorDialog(): void {
        this.dialog.open<ColorThemeDialogComponent>(ColorThemeDialogComponent, {});
    }
}
