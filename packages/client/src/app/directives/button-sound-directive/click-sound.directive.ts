import { Directive, HostListener, Inject } from '@angular/core';
import { SoundService } from './sound.service';
import { SoundName } from '@app/services/sound-service/sound.service';

@Directive({
    selector: 'button',
})
export class ClickSoundDirective {
    constructor(@Inject(SoundService) private soundService: SoundService) {}

    @HostListener('click') onClick(): void {
        this.soundService.playSound(SoundName.ClickSound);
    }
}
