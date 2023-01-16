import { OmitRecursive } from '@app/utils/types';

export type NoId<T, AdditionalIds extends string = ''> = OmitRecursive<T, `id${string}` | AdditionalIds>;
