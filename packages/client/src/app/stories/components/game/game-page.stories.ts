import { DragDropModule } from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChooseBlankTileDialogComponent } from '@app/components/choose-blank-tile-dialog/choose-blank-tile-dialog.component';
import { CommunicationBoxComponent } from '@app/components/communication-box/communication-box.component';
import { IconComponent } from '@app/components/icon/icon.component';
import { InformationBoxComponent } from '@app/components/information-box/information-box.component';
import { SquareComponent } from '@app/components/square/square.component';
import { TileRackComponent } from '@app/components/tile-rack/tile-rack.component';
import { TileComponent } from '@app/components/tile/tile.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { InitializedGameStoriesModule } from '@app/stories/modules/initialized-game-stories/initialized-game-stories.module';
import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { GameBoardWrapperComponent } from '@app/wrappers/game-board-wrapper/game-board-wrapper.component';
import { BoardComponent } from '@app/components/board/board.component';

export default {
    title: 'Game/Page',
    component: GamePageComponent,
    decorators: [
        moduleMetadata({
            declarations: [
                InformationBoxComponent,
                TileRackComponent,
                IconComponent,
                CommunicationBoxComponent,
                TileComponent,
                SquareComponent,
                ChooseBlankTileDialogComponent,
                GameBoardWrapperComponent,
                BoardComponent,
            ],
            imports: [
                InitializedGameStoriesModule,
                BrowserAnimationsModule,
                MatDialogModule,
                MatCardModule,
                MatButtonModule,
                MatGridListModule,
                MatExpansionModule,
                MatTooltipModule,
                ReactiveFormsModule,
                FormsModule,
                ScrollingModule,
                DragDropModule,
            ],
        }),
    ],
} as Meta;

const template: Story<GamePageComponent> = (args: GamePageComponent) => ({
    props: args,
});

export const primary = template.bind({});
