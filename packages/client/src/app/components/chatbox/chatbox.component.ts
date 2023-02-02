import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-chatbox',
    templateUrl: './chatbox.component.html',
    styleUrls: ['./chatbox.component.scss'],
})
export class ChatBoxComponent {
    @Input() title: string;
    @Input() hideIcon: boolean = false;
    @Input() hideMinimize: boolean = false;
    @Input() hideClose: boolean = false;
    @Output() onMinimize: EventEmitter<void> = new EventEmitter();
    @Output() onClose: EventEmitter<void> = new EventEmitter();

    handleMinimize() {
        this.onMinimize.next();
    }

    handleClose() {
        this.onClose.next();
    }
}
