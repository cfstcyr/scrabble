import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-page-header',
    templateUrl: './page-header.component.html',
    styleUrls: ['./page-header.component.scss'],
})
export class PageHeaderComponent {
    @Input() hideBackButton: boolean = false;
    @Input() title: string = 'SCRABBLE';
    @Input() button: string = '';
    @Input() buttonRoute: string = '/';
}
