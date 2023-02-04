import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { SignupContainerComponent } from './signup-container.component';

export default {
    title: 'Signup/Container',
    component: SignupContainerComponent,
    decorators: [
        moduleMetadata({
            declarations: [],
            imports: [ReactiveFormsModule, MatButtonModule],
            providers: [FormBuilder],
        }),
    ],
} as Meta;

const template: Story<SignupContainerComponent> = (args: SignupContainerComponent) => ({
    props: args,
});

export const primary = template.bind({});
