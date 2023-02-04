/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable no-redeclare */
import store from 'store2';
import { ValidatorSpec } from './validators';

interface Setting<T> {
    get: <K extends keyof T>(key: K) => T[K];
    set: <K extends keyof T>(key: K, value: NonNullable<T[K]>) => void;
    pipe: <K extends keyof T>(key: K, ...callback: ((value: T[K]) => NonNullable<T[K]>)[]) => NonNullable<T[K]>;
    has: <K extends keyof T>(key: K) => boolean;
    remove: <K extends keyof T>(key: K) => void;
    reset: () => void;
}

type SettingsSpecs<T> = { [K in keyof T]: ValidatorSpec<T[K]> };

export function settings<T>(specs: SettingsSpecs<T>): Setting<T>;
export function settings<T>(namespace: string, specs: SettingsSpecs<T>): Setting<T>;
export function settings<T>(namespaceOrSpec: string | SettingsSpecs<T>, maybeSpecs?: SettingsSpecs<T>): Setting<T> {
    const namespace = typeof namespaceOrSpec === 'string' ? namespaceOrSpec : undefined;
    const specs = (maybeSpecs ? maybeSpecs : namespaceOrSpec) as SettingsSpecs<T>;

    const settingsStore = store.namespace(namespace ?? 'scrabble');

    const get = <K extends keyof T>(key: K): T[K] => {
        return specs[key].parse(key as string, settingsStore.has(key) ? settingsStore.get(key) : undefined);
    };

    const set = <K extends keyof T>(key: K, value: NonNullable<T[K]>): void => {
        settingsStore.set(key, value);
    };

    const pipe = <K extends keyof T>(key: K, ...callback: ((value: T[K]) => NonNullable<T[K]>)[]): NonNullable<T[K]> => {
        const value = callback.reduce((v, f) => f(v), get(key)) as NonNullable<T[K]>;
        set(key, value);
        return value;
    };

    const has = <K extends keyof T>(key: K): boolean => {
        return settingsStore.has(key);
    };

    const remove = <K extends keyof T>(key: K): void => {
        settingsStore.remove(key);
    };

    const reset = (): void => {
        settingsStore.clear();
    };

    return { get, set, pipe, has, remove, reset };
}
