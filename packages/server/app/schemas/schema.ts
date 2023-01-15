export interface Schema {
    id: number;
}

export type NoId<T extends Schema> = Omit<T, 'id'>;
