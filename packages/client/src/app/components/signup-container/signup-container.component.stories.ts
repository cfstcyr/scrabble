import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppMaterialModule } from '@app/modules/material.module';
import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { IconComponent } from '@app/components/icon/icon.component';
import { SignupContainerComponent } from './signup-container.component';

export default {
    title: 'Signup/Container',
    component: SignupContainerComponent,
    decorators: [
        moduleMetadata({
            declarations: [IconComponent],
            imports: [ReactiveFormsModule, AppMaterialModule, FormsModule, BrowserAnimationsModule],
            providers: [FormBuilder],
        }),
    ],
} as Meta;

const template: Story<SignupContainerComponent> = (args: SignupContainerComponent) => ({
    props: args,
});

export const primary = template.bind({});
