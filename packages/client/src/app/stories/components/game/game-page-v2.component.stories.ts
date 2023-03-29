import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { MatCardModule } from '@angular/material/card';
import { GameBoardWrapperComponent } from '@app/wrappers/game-board-wrapper/game-board-wrapper.component';
import { MatDialogModule } from '@angular/material/dialog';
import { InitializedGameStoriesModule } from '@app/stories/modules/initialized-game-stories/initialized-game-stories.module';
import { BoardComponent } from '@app/components/board/board.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { SquareComponent } from '@app/components/square/square.component';
import { TileComponent } from '@app/components/tile/tile.component';
import { TileRackComponent } from '@app/components/tile-rack/tile-rack.component';
import { MatButtonModule } from '@angular/material/button';
import { IconComponent } from '@app/components/icon/icon.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { GamePlayersComponent } from '@app/components/game/game-players/game-players.component';
import { SrcDirective } from '@app/directives/src-directive/src.directive';
import { GameTilesLeftComponent } from '@app/components/game/game-tiles-left/game-tiles-left.component';
import { GameTimerComponent } from '@app/components/game/game-timer/game-timer.component';
import { CommunicationBoxComponent } from '@app/components/communication-box/communication-box.component';
<<<<<<< HEAD:packages/client/src/app/stories/components/game/game-page.stories.ts
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
=======
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ScrollingModule } from '@angular/cdk/scrolling';
>>>>>>> develop:packages/client/src/app/stories/components/game/game-page-v2.component.stories.ts

export default {
    title: 'Game/Page V2',
    component: GamePageComponent,
    decorators: [
        moduleMetadata({
            declarations: [
                GameBoardWrapperComponent,
                BoardComponent,
                SquareComponent,
                TileComponent,
                TileRackComponent,
                IconComponent,
                GamePlayersComponent,
                SrcDirective,
                GameTilesLeftComponent,
                GameTimerComponent,
                CommunicationBoxComponent,
<<<<<<< HEAD:packages/client/src/app/stories/components/game/game-page.stories.ts
                TileComponent,
                SquareComponent,
                ChooseBlankTileDialogComponent,
                GameBoardWrapperComponent,
                BoardComponent,
=======
>>>>>>> develop:packages/client/src/app/stories/components/game/game-page-v2.component.stories.ts
            ],
            imports: [
                MatCardModule,
                MatDialogModule,
                InitializedGameStoriesModule,
                MatGridListModule,
                MatButtonModule,
                MatTooltipModule,
                BrowserAnimationsModule,
                DragDropModule,
                FormsModule,
                ReactiveFormsModule,
                MatFormFieldModule,
                ScrollingModule,
            ],
        }),
    ],
} as Meta;

export const primary: Story<GamePageComponent> = (props: GamePageComponent) => ({ props });
