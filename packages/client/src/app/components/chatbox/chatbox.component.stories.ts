// also exported from '@storybook/angular' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/angular/types-6-0';
import { ChatBoxComponent } from './chatbox.component';
import { moduleMetadata } from '@storybook/angular';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { IconComponent } from '@app/components/icon/icon.component';

export default {
    title: 'Chat box',
    component: ChatBoxComponent,
    decorators: [
        moduleMetadata({
            declarations: [IconComponent],
            imports: [ReactiveFormsModule],
            providers: [FormBuilder],
        }),
    ],
} as Meta;

const template: Story<ChatBoxComponent> = (args: ChatBoxComponent) => ({
    props: args,
});

export const primary = template.bind({});

primary.args = {
    title: 'Général',
    messages: [
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        ...new Array(15).fill(0).map(() => ({ message: 'hey', isCurrentUser: false })),
        {
            message: 'bonjour',
            isCurrentUser: false,
        },
        {
            message: 'hola',
            isCurrentUser: true,
        },
        {
            message: 'sup',
            isCurrentUser: true,
        },
        {
            message: 'Exercitation cupidatat officia ut aliqua adipiscing irure culpa anim duis eiusmod ullamco',
            isCurrentUser: false,
        },
        {
            message: 'DAhnsiufhnudishfjdnsjkfndashfudashifgs',
            isCurrentUser: true,
        },
        {
            message: ':frog::trumpet:',
            isCurrentUser: true,
        },
    ],
    isOpen: true,
};

export const closed = template.bind({});

closed.args = {
    title: 'Général',
    isOpen: false,
};
