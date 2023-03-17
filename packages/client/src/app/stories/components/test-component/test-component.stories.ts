import { DragDropModule } from '@angular/cdk/drag-drop';
import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { TestComponentComponent } from './test-component.component';

export default {
    title: 'Test',
    component: TestComponentComponent,
    decorators: [
        moduleMetadata({
            declarations: [],
            imports: [DragDropModule],
        }),
    ],
} as Meta;

export const template: Story<TestComponentComponent> = (props: TestComponentComponent) => ({ props });
