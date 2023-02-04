export interface SettingsSpecRequired {
    default?: undefined;
    isRequired: true;
}

export interface SettingsSpecDefaultValue<T> {
    default: T;
    isRequired?: boolean;
}

export interface SettingsSpecUndefined {
    default?: undefined;
    isRequired?: false;
}

export type SettingsSpec<T> = (SettingsSpecRequired | SettingsSpecDefaultValue<T> | SettingsSpecUndefined) & {
    explanation?: string;
};

export interface ValidatorSpecRequired<T> {
    parse(key: string, value: unknown): T;
}

export interface ValidatorSpecDefaultValue<T> {
    parse(key: string, value: unknown): T;
}

export interface ValidatorSpecUndefined<T> {
    parse(key: string, value: unknown): T;
}

export type ValidatorSpec<T> = ValidatorSpecRequired<T> | ValidatorSpecDefaultValue<T> | ValidatorSpecUndefined<T>;
