import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export enum ThemeColor {
    Green = 'green-theme',
    Blue = 'blue-theme',
    Purple = 'purple-theme',
    Pink = 'pink-theme',
    Red = 'red-theme',
    Black = 'black-theme',
}

export enum HexThemeColor {
    Green = '#1B5E20',
    Blue = '#0A3B48',
    Purple = '#A801FF',
    Pink = '#FF01A2',
    Red = '#d92f08',
    Black = '#000000',
}

export const LOGO_PATH_GREEN = 'https://ucarecdn.com/d53bcb33-e937-4e0b-bd89-192468b2bb9f/';
export const LOGO_PATH_BLUE = 'https://ucarecdn.com/cf0af053-7248-43d0-8c7e-436d26710266/';
export const LOGO_PATH_PINK = 'https://ucarecdn.com/b9a8f9e1-6fbd-44cd-99dd-f70ea4b30257/';
export const LOGO_PATH_PURPLE = 'https://ucarecdn.com/8177dbde-343a-48c0-a72c-affb1583e64d/';
export const LOGO_PATH_BLACK = 'https://ucarecdn.com/d4b11830-844e-42c3-9d6f-3cd29ed00024/';
export const LOGO_PATH_RED = 'https://ucarecdn.com/3f0e76f5-a689-4bb4-93a4-b37040430cf4/';

@Injectable({
    providedIn: 'root',
})
export class ColorThemeService {
    private colorTheme = new BehaviorSubject<ThemeColor>(ThemeColor.Green);
    private logoTheme = new BehaviorSubject<string>(LOGO_PATH_GREEN);

    constructor() {
        this.setColorTheme(this.colorTheme.value);
    }

    setColorTheme(themeColor: ThemeColor) {
        const body = document.getElementsByTagName('body')[0];
        body.classList.remove(this.colorTheme.value);
        body.classList.add(themeColor);
        this.colorTheme.next(themeColor);
        this.logoTheme.next(this.getLogoLink());
        document.documentElement.style.setProperty('--primary', this.getPrimaryColor());
    }

    getColorTheme() {
        return this.colorTheme.asObservable();
    }

    getColorThemeValue() {
        return this.colorTheme.value;
    }

    getLogoTheme() {
        return this.logoTheme.asObservable();
    }

    private getPrimaryColor(): string {
        switch (this.colorTheme.value) {
            case ThemeColor.Blue:
                return HexThemeColor.Blue;
            case ThemeColor.Pink:
                return HexThemeColor.Pink;
            case ThemeColor.Purple:
                return HexThemeColor.Purple;
            case ThemeColor.Black:
                return HexThemeColor.Black;
            case ThemeColor.Red:
                return HexThemeColor.Red;
            case ThemeColor.Green:
                return HexThemeColor.Green;
            default:
                return HexThemeColor.Green;
        }
    }
    private getLogoLink(): string {
        switch (this.colorTheme.value) {
            case ThemeColor.Blue:
                return LOGO_PATH_BLUE;
            case ThemeColor.Pink:
                return LOGO_PATH_PINK;
            case ThemeColor.Purple:
                return LOGO_PATH_PURPLE;
            case ThemeColor.Black:
                return LOGO_PATH_BLACK;
            case ThemeColor.Red:
                return LOGO_PATH_RED;
            case ThemeColor.Green:
                return LOGO_PATH_GREEN;
            default:
                return LOGO_PATH_GREEN;
        }
    }
}

//   Color secondaryButton = Color.fromRGBO(216, 216, 216, 1);

//   Color menuSecondaryButton = Color.fromRGBO(222, 239, 223, 1);

//   Color cardColor = Color.fromRGBO(255, 255, 255, 1);
// }

// ThemeDetails setTheme(ThemeColor color) {
//   switch (color) {
//     case ThemeColor.green:
//       return ThemeDetails(color: color, logoPath: LOGO_PATH_GREEN);
//     case ThemeColor.blue:
//       return ThemeDetails(color: color, logoPath: LOGO_PATH_BLUE);
//     case ThemeColor.pink:
//       return ThemeDetails(color: color, logoPath: LOGO_PATH_PINK);
//     case ThemeColor.purple:
//       return ThemeDetails(color: color, logoPath: LOGO_PATH_PURPLE);
//     case ThemeColor.black:
//       return ThemeDetails(color: color, logoPath: LOGO_PATH_BLACK);
//     case ThemeColor.red:
//       return ThemeDetails(color: color, logoPath: LOGO_PATH_RED);
//   }
// }

// enum ThemeColor {
//   green,
//   blue,
//   purple,
//   pink,
//   red,
//   black;

//   Color get colorValue {
//     switch (this) {
//       case green:
//         return Color.fromRGBO(27, 94, 32, 1);
//       case blue:
//         return Color.fromRGBO(10, 59, 72, 1);
//       case purple:
//         return Color.fromRGBO(168, 1, 255, 1);
//       case pink:
//         return Color.fromRGBO(255, 1, 162, 1);
//       case red:
//         return Color.fromRGBO(185, 0, 76, 1);
//       case black:
//         return Colors.black;
//     }
//   }
// }

// class ThemeDetails {
//   ThemeColor color;
//   String logoPath;

//   ThemeDetails({required this.color, required this.logoPath});
// }
