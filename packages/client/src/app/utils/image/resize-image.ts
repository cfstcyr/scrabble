import { ImageSize, scaleImageSize } from './image-size';

export const resizeImage = (src: string, size: ImageSize, scale: number = 1) => {
    const { h, w } = scaleImageSize(size, scale);
    return src.startsWith('https://ucarecdn.com/') ? src + `-/resize/${h && h > 0 ? h : ''}x${w && w > 0 ? w : ''}/` : src;
};
