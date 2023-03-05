import { Pipe, PipeTransform } from '@angular/core';
import { generateSrcset } from '@app/utils/image/srcset';

@Pipe({
    name: 'srcset',
})
export class SrcsetPipe implements PipeTransform {
    transform(src: string, h: number | undefined, w: number | undefined): string {
        return generateSrcset(src, { h, w });
    }
}
