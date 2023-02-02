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

primary.args = {
    channels: [
        {
            id: '1',
            title: 'Chat 1',
            messages: [
                {
                    username: 'John',
                    isCurrentUser: false,
                    message: 'Bonjour!',
                },
            ],
        },
        {
            id: '2',
            title: 'Chat 2',
            messages: [],
        },
    ],
};

export const withVeryLongName = template.bind({});

withVeryLongName.args = {
    channels: [
        {
            id: '1',
            title: 'Very long channel name that never finishes because why not',
            messages: [],
        },
    ],
};
