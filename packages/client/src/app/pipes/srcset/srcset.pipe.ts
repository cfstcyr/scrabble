import { Pipe, PipeTransform } from '@angular/core';
import { generateSrcset } from '@app/utils/image/srcset';

@Pipe({
    name: 'srcset',
})
export class SrcsetPipe implements PipeTransform {
    // Create srcset string
    transform(src: string, h: number | undefined, w: number | undefined): string {
        return generateSrcset(src, { height: h, width: w });
    }
}
