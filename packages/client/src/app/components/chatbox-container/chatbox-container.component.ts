import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ClientChannel, ViewClientChannel } from '@app/classes/chat/channel';
import { DefaultDialogComponent } from '@app/components/default-dialog/default-dialog.component';
import {
    CHANNEL_NAME_MAX_LENGTH,
    CONFIRM_DELETE_CHANNEL,
    CONFIRM_DELETE_DIALOG_TITLE,
    CONFIRM_QUIT_CHANNEL,
    CONFIRM_QUIT_DIALOG_TITLE,
    DELETE,
    MAX_OPEN_CHAT,
    QUIT
} from '@app/constants/chat-constants';
import { CANCEL } from '@app/constants/components-constants';
import { Channel } from '@common/models/chat/channel';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-chatbox-container',
    templateUrl: './chatbox-container.component.html',
    styleUrls: ['./chatbox-container.component.scss'],
})
export class ChatboxContainerComponent implements OnDestroy, OnInit {
    @Input() channels: Observable<ClientChannel[]> = new Observable();
    @Input() joinableChannels: Observable<ClientChannel[]> = new Observable();
    @Input() joinedChannel: Observable<ClientChannel> = new Observable();
    @Input() quittedChannel: Observable<ClientChannel> = new Observable();
    @Output() sendMessage: EventEmitter<[Channel, string]> = new EventEmitter();
    @Output() createChannel: EventEmitter<string> = new EventEmitter();
    @Output() joinChannel: EventEmitter<Channel> = new EventEmitter();
    @Output() quitChannel: EventEmitter<Channel> = new EventEmitter();
    @Output() deleteChannel: EventEmitter<Channel> = new EventEmitter();
    @ViewChild('createChannelInput') createChannelInput: ElementRef<HTMLInputElement>;
    @ViewChild('joinChannelInput') joinChannelInput: ElementRef<HTMLInputElement>;
    createChannelForm: FormGroup;
    joinChannelForm: FormGroup;
    openedChannels: ClientChannel[] = [];
    channelMenuIsOpen: boolean = false;
    channelNameMaxLength: number = CHANNEL_NAME_MAX_LENGTH;
    private componentDestroyed$: Subject<boolean> = new Subject<boolean>();

    constructor(private readonly formBuilder: FormBuilder, private readonly dialog: MatDialog) {
        this.openedChannels = [];

        this.createChannelForm = this.formBuilder.group({
            createChannel: new FormControl(''),
        });
    }

    ngOnInit(): void {
        this.joinedChannel.pipe(takeUntil(this.componentDestroyed$)).subscribe((channel) => {
            if (!channel) return;
            else if (this.channelMenuIsOpen) this.showChannel(channel);
        });

        this.quittedChannel.pipe(takeUntil(this.componentDestroyed$)).subscribe((channel) => {
            if (!channel) return;
            this.minimizeChannel(channel);
        });
    }

    ngOnDestroy(): void {
        this.componentDestroyed$.next(false);
        this.componentDestroyed$.complete();
    }

    getChannelsForMenu(): Observable<ViewClientChannel[]> {
        const channelName = this.createChannelForm.value.createChannel.trim();

        return this.channels.pipe(
            map<ClientChannel[], ViewClientChannel[]>((channels) =>
                channels
                    .filter((channel) => channel.name.startsWith(channelName))
                    .map((channel) => ({
                        ...channel,
                        canOpen: !this.openedChannels.find((c) => channel.idChannel === c.idChannel),
                    })),
            ),
        );
    }

    getJoinableChannelsForMenu(): Observable<ViewClientChannel[]> {
        const channelName = this.createChannelForm.value.createChannel.trim();

        return this.joinableChannels.pipe(
            map<ClientChannel[], ViewClientChannel[]>((channels) =>
                channels
                    .filter((channel) => channel.name.startsWith(channelName))
                    .map((channel) => ({
                        ...channel,
                        canOpen: !this.openedChannels.find((c) => channel.idChannel === c.idChannel),
                    })),
            ),
        );
    }

    showChannel(channel: ClientChannel): void {
        this.openedChannels.push(channel);
        this.openedChannels = this.openedChannels.slice(-1 * MAX_OPEN_CHAT);
        this.closeMenu();
    }

    minimizeChannel(channel: ClientChannel): void {
        const index = this.openedChannels.findIndex(({ idChannel }) => channel.idChannel === idChannel);
        if (index >= 0) this.openedChannels.splice(index, 1);
    }

    closeMenu(): void {
        this.channelMenuIsOpen = false;
    }

    toggleMenu(): void {
        this.channelMenuIsOpen = !this.channelMenuIsOpen;

        if (this.channelMenuIsOpen) {
            this.openedChannels = this.openedChannels.slice(-1);
        }
    }

    handleSendMessage(channel: Channel, content: string): void {
        this.sendMessage.next([channel, content]);
    }

    joinChannelFromMenu(channel: ClientChannel): void {
        this.joinChannel.emit(channel);
        this.showChannel(channel);
    }

    handleCreateChannel(): void {
        if (!this.createChannelForm.valid) return;

        const channelName = this.createChannelForm.value.createChannel.trim();

        if (channelName.length === 0) return;

        this.createChannel.next(channelName);
        this.createChannelForm.reset();
        this.createChannelForm.setValue({ createChannel: '' });
        this.createChannelForm.setErrors({ createChannel: false });
        this.createChannelInput?.nativeElement?.blur();
    }

    handleQuitChannel(channel: ClientChannel): void {
        this.dialog.open(DefaultDialogComponent, {
            data: {
                title: CONFIRM_QUIT_DIALOG_TITLE,
                content: CONFIRM_QUIT_CHANNEL(channel.name),
                buttons: [
                    {
                        content: CANCEL,
                        closeDialog: true,
                        style: 'background-color: rgb(231, 231, 231)',
                    },
                    {
                        content: QUIT,
                        closeDialog: true,
                        style: 'background-color: #FA6B84; color: rgb(0, 0, 0)',
                        action: () => this.quitChannelFromMenu(channel),
                    },
                ],
            },
        });
    }

    handleDeleteChannel(channel: ClientChannel): void {
        this.dialog.open(DefaultDialogComponent, {
            data: {
                title: CONFIRM_DELETE_DIALOG_TITLE,
                content: CONFIRM_DELETE_CHANNEL(channel.name),
                buttons: [
                    {
                        content: CANCEL,
                        closeDialog: true,
                        style: 'background-color: rgb(231, 231, 231)',
                    },
                    {
                        content: DELETE,
                        closeDialog: true,
                        style: 'background-color: #FA6B84; color: rgb(0, 0, 0)',
                        action: () => this.deleteChannelFromMenu(channel),
                    },
                ],
            },
        });
    }

    private quitChannelFromMenu(channel: ClientChannel): void {
        this.minimizeChannel(channel);
        this.quitChannel.emit(channel);
    }

    private deleteChannelFromMenu(channel: ClientChannel): void {
        this.minimizeChannel(channel);
        this.deleteChannel.emit(channel);
    }
}
