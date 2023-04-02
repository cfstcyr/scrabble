import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { OverlayContainer } from '@angular/cdk/overlay';

@Injectable({
    providedIn: 'root',
})
export class ColorThemeService {
    private colorTheme = new BehaviorSubject<string>('custom-theme-1');

    constructor(private overlayContainer: OverlayContainer) {}

    setColorTheme(themeName: string) {
        document.documentElement.className = '';
        document.documentElement.classList.add(themeName);
        this.colorTheme.next(themeName);
        this.overlayContainer.getContainerElement().classList.remove('custom-theme-1', 'custom-theme-2');
        this.overlayContainer.getContainerElement().classList.add(themeName);
    }

    getColorTheme() {
        return this.colorTheme.asObservable();
    }
}
