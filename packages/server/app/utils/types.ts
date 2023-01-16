// eslint-disable-next-line @typescript-eslint/ban-types
export type OmitRecursive<T, O extends string, DefaultType = object> = T extends DefaultType
    ? Omit<
          {
              [K in keyof T]: T[K] extends unknown[] ? OmitRecursive<TryArrayElement<T[K]>, O, DefaultType>[] : OmitRecursive<T[K], O, DefaultType>;
          },
          O
      >
    : T;

export type ArrayElement<ArrayType extends unknown[]> = ArrayType extends (infer ElementType)[] ? ElementType : never;
export type TryArrayElement<T> = T extends (infer ElementType)[] ? ElementType : T;
