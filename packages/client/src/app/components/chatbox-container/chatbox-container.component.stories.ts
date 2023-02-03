import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { ChatBoxComponent } from '@app/components/chatbox/chatbox.component';
import { ChatboxContainerComponent } from './chatbox-container.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { IconComponent } from '@app/components/icon/icon.component';
import { MatButtonModule } from '@angular/material/button';
import { ChatboxMessageComponent } from '@app/components/chatbox-message/chatbox-message.component';
import { IconButtonComponent } from '@app/components/icon-button/icon-button.component';

export default {
    title: 'Chatbox/Container',
    component: ChatboxContainerComponent,
    decorators: [
        moduleMetadata({
            declarations: [ChatBoxComponent, ChatboxMessageComponent, IconComponent, IconButtonComponent],
            imports: [ReactiveFormsModule, MatButtonModule],
            providers: [FormBuilder],
        }),
    ],
} as Meta;

const template: Story<ChatboxContainerComponent> = (args: ChatboxContainerComponent) => ({
    props: args,
});

export const primary = template.bind({});

const channels = [
    {
        id: '1',
        name: 'Chat 1',
        messages: [
            {
                sender: { username: 'John', avatar: 'https://placedog.net/50' },
                content: 'Bonjour!',
            },
        ],
    },
    {
        id: '2',
        name: 'Chat 2',
        messages: [],
    },
];

primary.args = {
    channels,
    openedChannels: [channels[0]],
    channelMenuIsOpen: true,
};

export const withVeryLongName = template.bind({});

withVeryLongName.args = {
    channels: [
        {
            id: '1',
            name: 'Very long channel name that never finishes because why not',
            messages: [],
        },
    ],
};
