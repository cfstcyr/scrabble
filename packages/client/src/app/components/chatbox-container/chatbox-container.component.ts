import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ClientChannel } from '@app/classes/chat/channel';
import { Channel } from '@common/models/chat/channel';

@Component({
    selector: 'app-chatbox-container',
    templateUrl: './chatbox-container.component.html',
    styleUrls: ['./chatbox-container.component.scss'],
})
export class ChatboxContainerComponent {
    @Input() channels: ClientChannel[] = [];
    @Output() sendMessage: EventEmitter<[Channel, string]> = new EventEmitter();
    @Output() createChannel: EventEmitter<string> = new EventEmitter();
    @ViewChild('createChannelInput') createChannelInput: ElementRef<HTMLInputElement>;
    createChannelForm: FormGroup;
    openedChannels: ClientChannel[] = [];
    startChannelIsOpen: boolean = false;

    constructor(private readonly formBuilder: FormBuilder) {
        this.openedChannels = [];

        this.createChannelForm = this.formBuilder.group({
            createChannel: new FormControl(''),
        });
    }

    getChannelsForStartChannel(): (ClientChannel & { canOpen: boolean })[] {
        return this.channels.map<ClientChannel & { canOpen: boolean }>((channel) => ({
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

    leaveChannel(channel: ClientChannel) {
        if (confirm(`Do you want to quit channel "${channel.name}"?`)) {
            this.minimizeChannel(channel);
            this.channels = this.channels.filter(({ id }) => id !== channel.id);
        }
    }

    closeStartChannel() {
        this.startChannelIsOpen = false;
    }

    toggleNewMessage() {
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
        this.createChannelInput.nativeElement.blur();
    }
}
