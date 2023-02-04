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

function parseBool(v: unknown): boolean | undefined {
    if (v === true || v === 1 || v === '1' || v === 'true' || v === 't' || v === 'yes' || v === 'y') return true;
    if (v === false || v === 0 || v === '0' || v === 'false' || v === 'f' || v === 'no' || v === 'n') return false;
    return undefined;
}

export function bool<T extends boolean | undefined = boolean | undefined>(spec?: SettingsSpecUndefined): ValidatorSpecUndefined<T>;
export function bool<T extends boolean = boolean>(spec: SettingsSpecDefaultValue<T>): ValidatorSpecDefaultValue<T>;
export function bool<T extends boolean = boolean>(spec: SettingsSpecRequired): ValidatorSpecRequired<T>;
export function bool<T extends boolean = boolean>(spec?: SettingsSpec<T>): ValidatorSpec<T> {
    const parse = (key: string, value: unknown): T => {
        const s = { default: undefined, isRequired: false, ...((spec ?? {}) as SettingsSpec<T>) };

        const b = parseBool(value);
        const out = (b ? b : s.default) as T;

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
