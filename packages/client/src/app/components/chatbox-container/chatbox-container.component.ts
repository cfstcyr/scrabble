import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ClientChannel, ViewClientChannel } from '@app/classes/chat/channel';
import { CONFIRM_QUIT_CHANNEL, CONFIRM_QUIT_DIALOG_TITLE, MAX_OPEN_CHAT } from '@app/constants/chat-constants';
import { Channel } from '@common/models/chat/channel';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DefaultDialogComponent } from '@app/components/default-dialog/default-dialog.component';

@Component({
    selector: 'app-chatbox-container',
    templateUrl: './chatbox-container.component.html',
    styleUrls: ['./chatbox-container.component.scss'],
})
export class ChatboxContainerComponent implements OnInit, OnDestroy {
    @Input() channels: ClientChannel[] = [];
    @Input() joinedChannel: Observable<ClientChannel> = new Subject();
    @Output() sendMessage: EventEmitter<[Channel, string]> = new EventEmitter();
    @Output() createChannel: EventEmitter<string> = new EventEmitter();
    @Output() joinChannel: EventEmitter<string> = new EventEmitter();
    @Output() quitChannel: EventEmitter<string> = new EventEmitter();
    @ViewChild('createChannelInput') createChannelInput: ElementRef<HTMLInputElement>;
    @ViewChild('joinChannelInput') joinChannelInput: ElementRef<HTMLInputElement>;
    createChannelForm: FormGroup;
    joinChannelForm: FormGroup;
    openedChannels: ClientChannel[] = [];
    channelMenuIsOpen: boolean = false;
    private componentDestroyed$: Subject<boolean> = new Subject<boolean>();

    constructor(private readonly formBuilder: FormBuilder, private readonly dialog: MatDialog) {
        this.openedChannels = [];

        this.createChannelForm = this.formBuilder.group({
            createChannel: new FormControl(''),
        });
        this.joinChannelForm = this.formBuilder.group({
            joinChannel: new FormControl(''),
        });
    }

    ngOnInit(): void {
        this.joinedChannel.pipe(takeUntil(this.componentDestroyed$)).subscribe((channel) => {
            if (!channel) return;
            if (this.channelMenuIsOpen) this.showChannel(channel);
        });
    }

    ngOnDestroy(): void {
        this.componentDestroyed$.next(false);
        this.componentDestroyed$.complete();
    }

    getChannelsForMenu(): ViewClientChannel[] {
        return this.channels.map<ViewClientChannel>((channel) => ({
            ...channel,
            canOpen: !this.openedChannels.find((c) => channel.id === c.id),
        }));
    }

    showChannel(channel: ClientChannel): void {
        this.openedChannels.push(channel);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        this.openedChannels = this.openedChannels.slice(-1 * MAX_OPEN_CHAT);
        this.closeMenu();
    }

    minimizeChannel(channel: ClientChannel): void {
        const index = this.openedChannels.findIndex(({ id }) => channel.id === id);
        if (index >= 0) this.openedChannels.splice(index, 1);
    }

    closeMenu(): void {
        this.channelMenuIsOpen = false;
    }

    toggleMenu(): void {
        this.channelMenuIsOpen = !this.channelMenuIsOpen;

        if (this.channelMenuIsOpen) {
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            this.openedChannels = this.openedChannels.slice(-1);
        }
    }

    handleSendMessage(channel: Channel, content: string): void {
        this.sendMessage.next([channel, content]);
    }

    handleCreateChannel(): void {
        if (!this.createChannelForm.valid) return;

        const channelName = this.createChannelForm.value.createChannel.trim();

        if (channelName.length === 0) return;

        this.createChannel.next(channelName);
        this.createChannelForm.reset();
        this.createChannelForm.setErrors({ createChannel: false });
        this.createChannelInput?.nativeElement?.blur();
    }

    handleJoinChannel(): void {
        if (!this.joinChannelForm.valid) return;

        const channelName = this.joinChannelForm.value.joinChannel.trim();

        if (channelName.length === 0) return;

        this.joinChannel.next(channelName);
        this.joinChannelForm.reset();
        this.joinChannelForm.setErrors({ joinChannel: false });
        this.joinChannelInput?.nativeElement?.blur();
    }

    handleQuitChannel(channel: ClientChannel): void {
        this.dialog.open(DefaultDialogComponent, {
            data: {
                title: CONFIRM_QUIT_DIALOG_TITLE,
                content: CONFIRM_QUIT_CHANNEL(channel.name),
                buttons: [
                    {
                        content: 'Annuler',
                        closeDialog: true,
                    },
                    {
                        content: 'Quitter',
                        closeDialog: true,
                        action: () => {
                            this.minimizeChannel(channel);
                            this.quitChannel.emit(channel.name);
                        },
                    },
                ],
            },
        });
    }
}
