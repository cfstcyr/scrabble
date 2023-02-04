/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable no-redeclare */
import {
    SettingsSpec,
    SettingsSpecDefaultValue,
    SettingsSpecRequired,
    SettingsSpecUndefined,
    ValidatorSpec,
    ValidatorSpecDefaultValue,
    ValidatorSpecRequired,
    ValidatorSpecUndefined,
} from './types';

export function json<T extends object | undefined = object | undefined>(spec?: SettingsSpecUndefined): ValidatorSpecUndefined<T>;
export function json<T extends object = object>(spec: SettingsSpecDefaultValue<T>): ValidatorSpecDefaultValue<T>;
export function json<T extends object = object>(spec: SettingsSpecRequired): ValidatorSpecRequired<T>;
export function json<T extends object = object>(spec?: SettingsSpec<T>): ValidatorSpec<T> {
    const parse = (key: string, value: unknown): T => {
        const s = { default: undefined, isRequired: false, ...((spec ?? {}) as SettingsSpec<T>) };

        let j = typeof value === 'object' ? value : undefined;

        if (j === undefined) {
            try {
                j = JSON.parse(String(value));
            } catch (e) {
                //
            }
        }

        const out = (value ? value : s.default) as T;

        if (s.default === undefined && !s.isRequired) {
            return out;
        }

        if (!out)
            throw new Error(
                `No settings found for key "${key}. Did you forget to set it beforehand?${s.explanation ? `\n\t${key}: ${s.explanation}` : ''}"`,
            );

        return out;
    };

    return { parse };
}
