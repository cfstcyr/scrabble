export const increment = (n: number | undefined): number => (n ?? 0) + 1;
export const decrement = (n: number | undefined): number => (n ?? 0) - 1;
export const add =
    (value: number) =>
    (n: number | undefined): number =>
        (n ?? 0) + value;
export const sub =
    (value: number) =>
    (n: number | undefined): number =>
        (n ?? 0) - value;
export const multiply =
    (value: number) =>
    (n: number | undefined): number =>
        (n ?? 0) * value;
export const divide =
    (value: number) =>
    (n: number | undefined): number =>
        (n ?? 0) / value;
export const mod =
    (value: number) =>
    (n: number | undefined): number =>
        (n ?? 0) % value;
