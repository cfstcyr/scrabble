import { OmitRecursive } from '@app/utils/types';

export interface Schema {
    id: number;
}

export type NoId<T, AdditionalIds extends string = ''> = OmitRecursive<T, 'id' | AdditionalIds, Schema>;
