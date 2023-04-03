import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ColorThemeService, ThemeColor } from '@app/services/color-theme-service/color-theme.service';

@Component({
    selector: 'app-color-theme-dialog',
    templateUrl: 'color-theme-dialog.html',
    styleUrls: ['color-theme-dialog.scss'],
})
export class ColorThemeDialogComponent {
    themeColors: typeof ThemeColor = ThemeColor;
    currentColor: ThemeColor;
    constructor(private colorThemeService: ColorThemeService, private dialogRef: MatDialogRef<ColorThemeDialogComponent>) {
        dialogRef.backdropClick().subscribe(() => {
            this.closeDialog();
        });
        this.currentColor = this.colorThemeService.getColorThemeValue();
    }

    closeDialog(): void {
        this.dialogRef.close();
    }

    changeTheme(selectedColor: ThemeColor) {
        this.colorThemeService.setColorTheme(selectedColor);
    }
}
