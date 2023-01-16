/* eslint-disable @typescript-eslint/ban-types */

interface AggregateConfig<
    T extends object,
    IdKey extends keyof T,
    FieldKey extends string | number,
    MainItemKeys extends keyof T,
    AggregatedItemKey extends keyof Omit<T, FieldKey>,
> {
    idKey: IdKey;
    fieldKey: FieldKey;
    mainItemKeys: MainItemKeys[];
    aggregatedItemKeys: AggregatedItemKey | AggregatedItemKey[];
}

export const aggregate = <
    T extends object,
    IdKey extends keyof T,
    FieldKey extends string | number,
    MainItemKeys extends keyof Omit<T, FieldKey>,
    AggregatedItemKey extends keyof Omit<T, FieldKey>,
    AggregatedItemKeys extends keyof AggregatedItemKey | AggregatedItemKey[],
    AggregatedItem = AggregatedItemKeys extends AggregatedItemKey[] ? { [K in AggregatedItemKey]: T[MainItemKeys] } : T[AggregatedItemKey],
    MainItem = { [K in MainItemKeys]: T[MainItemKeys] } & { [K in FieldKey]: AggregatedItem[] },
>(
    items: T[],
    { idKey, fieldKey, mainItemKeys, aggregatedItemKeys }: AggregateConfig<T, IdKey, FieldKey, MainItemKeys, AggregatedItemKey>,
) => {
    const makeMainItem = (item: T): MainItem => {
        const mainItem: { [K in MainItemKeys]?: T[K] } & { [K in FieldKey]: AggregatedItem[] } = {
            [fieldKey]: new Array<AggregatedItem>(),
        } as { [K in MainItemKeys]?: T[K] } & { [K in FieldKey]: AggregatedItem[] };

        for (const key of mainItemKeys) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (mainItem[key] as any) = item[key];
        }

        return mainItem as unknown as MainItem;
    };

    const makeAggregatedItem = Array.isArray(aggregatedItemKeys)
        ? (item: T): AggregatedItem => {
              const aggregatedItem: Partial<T> = {};

              for (const key of aggregatedItemKeys) {
                  aggregatedItem[key] = item[key];
              }

              return aggregatedItem as AggregatedItem;
          }
        : (item: T): AggregatedItem => item[aggregatedItemKeys as unknown as keyof T] as unknown as AggregatedItem;

    return [
        ...items
            .reduce((map, c) => {
                const entry: MainItem = map.get(c[idKey]) ?? makeMainItem(c);

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                entry[fieldKey as any].push(makeAggregatedItem(c));

                map.set(c[idKey], entry);

                return map;
            }, new Map<T[IdKey], MainItem>())
            .values(),
    ];
};
