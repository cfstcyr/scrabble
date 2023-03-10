export interface ImageSize {
    h?: number;
    w?: number;
}

export const scaleImageSize = ({ h, w }: ImageSize, scale: number) => {
    const size: ImageSize = {};

    if (h !== undefined) size.h = h * scale;
    if (w !== undefined) size.w = w * scale;

    return size;
};
