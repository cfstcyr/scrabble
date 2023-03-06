import { ImageSize } from './image-size';
import { resizeImage } from './resize-image';

export const generateSrcset = (src: string, size: ImageSize) => {
    return src.startsWith('https://ucarecdn.com/') ? `${resizeImage(src, size)} 1x, ${resizeImage(src, size, 2)} 2x,` : src;
};
