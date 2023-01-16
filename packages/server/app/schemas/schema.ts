import { OmitRecursive } from '@app/utils/types';

// eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-empty-interface
export interface Schema {
    _?: never;
}

// export interface Schema {
//     id: number;
// }

// eslint-disable-next-line @typescript-eslint/ban-types
export type NoId<T, AdditionalIds extends string = ''> = OmitRecursive<T, `id${string}` | AdditionalIds, Schema>;
