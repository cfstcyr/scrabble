import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppMaterialModule } from '@app/modules/material.module';
import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { IconComponent } from '@app/components/icon/icon.component';
import { JoinerListContainerComponent } from './joiner-list-container.component';

export default {
    title: 'JoinerList/Container',
    component: JoinerListContainerComponent,
    decorators: [
        moduleMetadata({
            declarations: [IconComponent],
            imports: [ReactiveFormsModule, AppMaterialModule, FormsModule, BrowserAnimationsModule],
            providers: [FormBuilder],
        }),
    ],
} as Meta;

const template: Story<JoinerListContainerComponent> = (args: JoinerListContainerComponent) => ({
    props: args,
});

export const primary = template.bind({});
