/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable no-redeclare */
import store from 'store2';
import { ValidatorSpec } from './validators';

export interface Setting<T> {
    /**
     * Get value from settings
     *
     * @param key
     * @returns
     */
    get: <K extends keyof T>(key: K) => T[K];

    /**
     * Set value to settings
     *
     * @param key
     * @param value
     */
    set: <K extends keyof T>(key: K, value: NonNullable<T[K]>) => void;

    /**
     * Pipe value from settings through a series of operators and sets its value.
     *
     * **Example usage :**
     * ```typescript
     * // Get value from settings, multiply it by 4, max its value by 12, then store its value in the settings and returns it.
     * const updatedNumber = mySettings.get(
     *      'number',
     *      (value) => (value ?? 1) * 4,
     *      (value) => Math.max(value, 12),
     * );
     * ```
     *
     *
     * **Example with operators :**
     * ```typescript
     * const clamp =
     *      (min: number, max: number) =>
     *      (value: number | undefined) =>
     *          Math.min(max, Math.max(value ?? 0));
     *
     * // Get value from settings, clamp it between 0 and 10, then store its value in the settings and returns it.
     * const updatedNumber = mySettings.get('number', clamp(0, 10));
     * ```
     *
     * @param key
     * @param callback
     * @returns Value returned by the operators
     */
    pipe: <K extends keyof T>(
        key: K,
        operator0: (value: T[K]) => NonNullable<T[K]>,
        ...operators: ((value: NonNullable<T[K]>) => NonNullable<T[K]>)[]
    ) => NonNullable<T[K]>;

    /**
     * Check whether a key has a value set.
     *
     * @param key
     * @returns
     */
    has: <K extends keyof T>(key: K) => boolean;

    /**
     * Removes value from settings
     *
     * @param key
     */
    remove: <K extends keyof T>(key: K) => void;

    /**
     * Removes all values from settings. (Only affect values in this instance of settings)
     */
    reset: () => void;
}

type SettingsSpecs<T> = { [K in keyof T]: ValidatorSpec<T[K]> };

/**
 * Creates settings instance.
 *
 * **Example :**
 * ```typescript
 * const mySettings = settings({
 *      number: num(),
 *      string: str({ default: '' }),
 *      date: date({ isRequired: true }),
 * });
 *
 * // Returns number or undefined
 * const myNumber = mySettings.get('number');
 * // Returns string or default value
 * const myString = mySettings.get('string');
 * // Returns date of throw if not present
 * const myDate = mySettings.get('date');
 * ```
 *
 * **Example with namespace :**
 * ```typescript
 * const mySettings = settings('my-namespace', {
 *      // This value will be saved as `my-namespace.number` in storage
 *      number: num(),
 * });
 * ```
 *
 * @param specs
 */
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

    const pipe = <K extends keyof T>(
        key: K,
        callback0: (value: T[K]) => NonNullable<T[K]>,
        ...callback: ((value: NonNullable<T[K]>) => NonNullable<T[K]>)[]
    ): NonNullable<T[K]> => {
        const value = callback.reduce((v, f) => f(v), callback0(get(key))) as NonNullable<T[K]>;
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
