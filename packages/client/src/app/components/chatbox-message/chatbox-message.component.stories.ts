// also exported from '@storybook/angular' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/angular/types-6-0';
import { ChatboxMessageComponent } from './chatbox-message.component';
import { moduleMetadata } from '@storybook/angular';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { IconComponent } from '@app/components/icon/icon.component';
import { ChatBoxComponent } from '@app/components/chatbox/chatbox.component';
import { IconButtonComponent } from '@app/components/icon-button/icon-button.component';
import { ChatMessage } from '@common/models/chat/chat-message';

export default {
    title: 'Chatbox/Messages',
    component: ChatboxMessageComponent,
    decorators: [
        moduleMetadata({
            declarations: [ChatBoxComponent, IconComponent, IconButtonComponent],
            imports: [ReactiveFormsModule],
            providers: [FormBuilder],
        }),
    ],
} as Meta;

const template: Story<ChatboxMessageComponent> = (args: ChatboxMessageComponent) => ({
    props: args,
});

export const primary = template.bind({});

primary.args = {
    title: 'Général',
    messages: [
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        ...new Array(15).fill(0).map<ChatMessage>(() => ({ content: 'hey', sender: { username: 'John', avatar: '' } })),
        {
            content: 'bonjour',
            sender: { username: 'Guy', avatar: '' },
        },
        {
            content: 'hola',
            sender: { username: 'Me', avatar: '' },
        },
        {
            content: 'sup',
            sender: { username: 'Me', avatar: '' },
        },
        {
            content: 'Exercitation cupidatat officia ut aliqua adipiscing irure culpa anim duis eiusmod ullamco',
            sender: { username: 'Guy', avatar: '' },
        },
    ],
    icon: 'https://placedog.net/50',
    icon2: 'https://placedog.net/51',
};

export const empty = template.bind({});

empty.args = {
    title: 'Empty chat',
    messages: [],
    icon: 'https://placedog.net/52',
    icon2: 'https://placedog.net/53',
};
