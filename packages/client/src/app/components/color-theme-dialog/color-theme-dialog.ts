import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ColorThemeService } from '@app/services/color-theme-service/color-theme.service';

@Component({
    selector: 'app-color-theme-dialog',
    templateUrl: 'color-theme-dialog.html',
    styleUrls: ['color-theme-dialog.scss'],
})
export class ColorThemeDialogComponent {
    constructor(private colorThemeService: ColorThemeService, private dialogRef: MatDialogRef<ColorThemeDialogComponent>) {
        dialogRef.backdropClick().subscribe(() => {
            this.closeDialog();
        });
    }

    closeDialog(): void {
        this.dialogRef.close();
    }

    changeTheme(selectedColor: string) {
        console.log(selectedColor);
        this.colorThemeService.setColorTheme(selectedColor);
    }
}
