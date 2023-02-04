export interface SettingsModule {
    authenticationToken: string;
    playerName: string;
    dictionaryName: string;
    timer: number;
}

export const DEFAULT_SETTINGS = {
    playerName: '',
} as const;
