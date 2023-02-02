// also exported from '@storybook/angular' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/angular/types-6-0';
import { ChatboxMessageComponent, Message } from './chatbox-message.component';
import { moduleMetadata } from '@storybook/angular';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { IconComponent } from '@app/components/icon/icon.component';
import { ChatBoxComponent } from '@app/components/chatbox/chatbox.component';
import { IconButtonComponent } from '@app/components/icon-button/icon-button.component';

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
        ...new Array(15).fill(0).map<Message>(() => ({ message: 'hey', isCurrentUser: false, username: 'John' })),
        {
            message: 'bonjour',
            isCurrentUser: false,
            username: 'Guy',
        },
        {
            message: 'hola',
            isCurrentUser: true,
            username: 'Me',
        },
        {
            message: 'sup',
            isCurrentUser: true,
            username: 'Me',
        },
        {
            message: 'Exercitation cupidatat officia ut aliqua adipiscing irure culpa anim duis eiusmod ullamco',
            isCurrentUser: false,
            username: 'Guy',
        },
        {
            message: 'DAhnsiufhnudishfjdnsjkfndashfudashifgs',
            isCurrentUser: true,
            username: 'Me',
        },
        {
            message: ':frog::trumpet:',
            isCurrentUser: true,
            username: 'Me',
        },
    ],
};

export const empty = template.bind({});

empty.args = {
    title: 'Empty chat',
    messages: [],
};
