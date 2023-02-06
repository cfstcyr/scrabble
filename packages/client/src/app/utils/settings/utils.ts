export const capitalize = <T extends string>(str: T): Capitalize<T> => (str.substring(0, 1).toUpperCase() + str.substring(1)) as Capitalize<T>;
export const toGetter = <T extends string>(str: T): `get${Capitalize<T>}` => `get${capitalize(str)}`;
export const toSetter = <T extends string>(str: T): `set${Capitalize<T>}` => `set${capitalize(str)}`;
