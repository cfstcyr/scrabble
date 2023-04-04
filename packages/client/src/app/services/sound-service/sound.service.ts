import { Injectable } from '@angular/core';
import { ROUTE_CREATE_WAITING, ROUTE_GAME, ROUTE_GAME_OBSERVER, ROUTE_JOIN_WAITING, ROUTE_PUZZLE } from '@app/constants/routes-constants';
import { Howl } from 'howler';

export enum SoundName {
    ClickSound = 'ClickSound',
    LowTimeSound = 'LowTimeSound',
    CriticalLowTimeSound = 'CriticalLowTimeSound',
    VictorySound = 'VictorySound',
    EndGameSound = 'EndGameSound',
    TilePlacementSound = 'TilePlacementSound',
}

export enum MusicName {
    BackgroundMusic1 = 'BackgroundMusic1',
    // LowTimeSound = 'LowTimeSound',
    // VictorySound = 'VictorySound',
    // EndGameSound = 'EndGameSound',
    // TilePlacementSound = 'TilePlacementSound',
}

export enum MusicType {
    NoMusic,
    BackgroundMusic,
    LobbyMusic,
}

export const PAGES_NO_MUSIC = [ROUTE_GAME, ROUTE_PUZZLE, ROUTE_GAME_OBSERVER];
export const PAGES_LOBBY_MUSIC = [ROUTE_CREATE_WAITING, ROUTE_JOIN_WAITING];
export const SOUND_FOLDER_PATH = 'src/assets/sound/';
export const LOW_TIME = 20;
export const CRITICAL_LOW_TIME = 5;

@Injectable({
    providedIn: 'root',
})
export class SoundService {
    isMusicEnabled: boolean = true;
    isSoundEnabled: boolean = true;
    private backgroundMusic: Howl;
    private lobbyMusic: Howl;
    private currentMusicType: MusicType = MusicType.BackgroundMusic;
    private soundsMap: Map<SoundName, Howl>;
    constructor() {
        this.soundsMap = new Map();
        for (const sound of Object.values(SoundName)) {
            this.soundsMap.set(
                sound,
                new Howl({
                    src: [`${SOUND_FOLDER_PATH}${sound}`],
                }),
            );
        }

        this.backgroundMusic = new Howl({
            src: [`${SOUND_FOLDER_PATH}${MusicName.BackgroundMusic1}`],
            loop: true,
        });
    }

    playBackgroundMusic() {
        this.backgroundMusic.play();
    }

    stopBackgroundMusic() {
        this.backgroundMusic.stop();
    }

    playLobbyMusic() {
        this.lobbyMusic.play();
    }

    stopLobbyMusic() {
        this.lobbyMusic.stop();
    }

    changeMusic(newUrl: string) {
        const newUrlType = PAGES_NO_MUSIC.includes(newUrl)
            ? MusicType.NoMusic
            : PAGES_LOBBY_MUSIC.includes(newUrl)
            ? MusicType.LobbyMusic
            : MusicType.BackgroundMusic;

        if (this.currentMusicType !== newUrlType) {
            console.log('changeMusic would have changed the music type from: ', this.currentMusicType, ' to: ', newUrlType);
            // stop the correct music
            // start the correct music
            this.currentMusicType = newUrlType;
        }
    }

    playSound(soundName: SoundName) {
        const sound = this.soundsMap.get(soundName);
        if (sound) sound.play();
        else {
            console.log('soundName: ', soundName, 'is Not found in the map or in the assets');
        }
    }
}
