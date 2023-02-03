import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ClientChannel, ViewClientChannel } from '@app/classes/chat/channel';
import { Channel } from '@common/models/chat/channel';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-chatbox-container',
    templateUrl: './chatbox-container.component.html',
    styleUrls: ['./chatbox-container.component.scss'],
})
export class ChatboxContainerComponent implements OnInit, OnDestroy {
    @Input() channels: ClientChannel[] = [];
    @Input() joinedChannel: Subject<ClientChannel> = new Subject();
    @Output() sendMessage: EventEmitter<[Channel, string]> = new EventEmitter();
    @Output() createChannel: EventEmitter<string> = new EventEmitter();
    @Output() joinChannel: EventEmitter<string> = new EventEmitter();
    @Output() quitChannel: EventEmitter<string> = new EventEmitter();
    @ViewChild('createChannelInput') createChannelInput: ElementRef<HTMLInputElement>;
    @ViewChild('joinChannelInput') joinChannelInput: ElementRef<HTMLInputElement>;
    createChannelForm: FormGroup;
    joinChannelForm: FormGroup;
    openedChannels: ClientChannel[] = [];
    startChannelIsOpen: boolean = false;
    private componentDestroyed$: Subject<boolean> = new Subject<boolean>();

    constructor(private readonly formBuilder: FormBuilder) {
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
            if (this.startChannelIsOpen) this.showChannel(channel);
        });
    }

    ngOnDestroy(): void {
        this.componentDestroyed$.next(false);
        this.componentDestroyed$.complete();
    }

    getChannelsForStartChannel(): ViewClientChannel[] {
        return this.channels.map<ViewClientChannel>((channel) => ({
            ...channel,
            canOpen: !this.openedChannels.find((c) => channel.id === c.id),
        }));
    }

    showChannel(channel: ClientChannel) {
        this.openedChannels.push(channel);
        this.closeStartChannel();
    }

    minimizeChannel(channel: ClientChannel) {
        const index = this.openedChannels.findIndex(({ id }) => channel.id === id);
        this.openedChannels.splice(index, 1);
    }

    closeStartChannel() {
        this.startChannelIsOpen = false;
    }

    toggleStartChannel() {
        this.startChannelIsOpen = !this.startChannelIsOpen;
    }

    handleSendMessage(channel: Channel, content: string) {
        this.sendMessage.next([channel, content]);
    }

    handleCreateChannel() {
        if (!this.createChannelForm.valid) return;

        const channelName = this.createChannelForm.value.createChannel.trim();

        if (channelName.length === 0) return;

        this.createChannel.next(channelName);
        this.createChannelForm.reset();
        this.createChannelForm.setErrors({ createChannel: false });
        this.createChannelInput?.nativeElement?.blur();
    }

    handleJoinChannel() {
        if (!this.joinChannelForm.valid) return;

        const channelName = this.joinChannelForm.value.joinChannel.trim();

        if (channelName.length === 0) return;

        this.joinChannel.next(channelName);
        this.joinChannelForm.reset();
        this.joinChannelForm.setErrors({ joinChannel: false });
        this.joinChannelInput?.nativeElement?.blur();
    }

    handleQuitChannel(channel: ClientChannel) {
        if (confirm(`Do you want to quit channel "${channel.name}"?`)) {
            this.minimizeChannel(channel);
            this.quitChannel.emit(channel.name);
        }
    }
}
