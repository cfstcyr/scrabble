import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { BoardComponent } from '@app/components/board/board.component';
import { IconComponent } from '@app/components/icon/icon.component';
import { SquareComponent } from '@app/components/square/square.component';
import { TileComponent } from '@app/components/tile/tile.component';
import { InitializedGameStoriesModule } from '@app/stories/modules/initialized-game-stories/initialized-game-stories.module';
import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { Subject } from 'rxjs';

export default {
    title: 'Game/Board',
    component: BoardComponent,
    decorators: [
        moduleMetadata({
            declarations: [IconComponent, TileComponent, SquareComponent],
            imports: [InitializedGameStoriesModule, MatGridListModule, MatCardModule, DragDropModule],
        }),
    ],
} as Meta;

const template: Story<BoardComponent> = (args: BoardComponent) => {
    // eslint-disable-next-line dot-notation
    args['focusableComponentDestroyed$'] = new Subject();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (args as any).marginColumnSize = 1;

    return {
        props: args,
        template: '<div style="max-width: 700px;"><app-board></app-board></div>',
    };
};

export const primary = template.bind({});
