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

export function str(spec?: SettingsSpecUndefined): ValidatorSpecUndefined<string | undefined>;
export function str(spec: SettingsSpecDefaultValue<string>): ValidatorSpecDefaultValue<string>;
export function str(spec: SettingsSpecRequired): ValidatorSpecRequired<string>;
export function str(spec?: SettingsSpec<string>): ValidatorSpec<string> {
    const parse = (key: string, value: unknown): string => {
        const s = { default: undefined, isRequired: false, ...((spec ?? {}) as SettingsSpec<string>) };

        const out = (value ? String(value) : s.default) as string;

        if (s.default === undefined && !s.isRequired) {
            return out;
        }

        if (out === undefined)
            throw new Error(
                `No settings found for key "${key}. Did you forget to set it beforehand?${s.explanation ? `\n\t${key}: ${s.explanation}` : ''}"`,
            );

        return out;
    };

    return { parse };
}
