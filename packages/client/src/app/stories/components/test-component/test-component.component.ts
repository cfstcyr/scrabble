/* eslint-disable @typescript-eslint/no-magic-numbers */
import { CdkDragDrop, CdkDropList, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { DragAndDropService } from '@app/services/drag-and-drop-service/drag-and-drop.service';

const SIZE = 5;

@Component({
    selector: 'app-test-component',
    templateUrl: './test-component.component.html',
    styleUrls: ['./test-component.component.scss'],
})
export class TestComponentComponent implements AfterViewInit {
    @ViewChild('itemsList') itemsList: CdkDropList;
    @ViewChild('itemsList2') itemsList2: CdkDropList;
    grid = new Array(SIZE).fill(0).map(() => new Array<string | undefined>(SIZE).fill(undefined));
    items = ['A', 'B', 'C', 'D', 'E'];
    items2 = ['1', '2'];

    constructor(private dragAndDropService: DragAndDropService) {}

    drop(event: CdkDragDrop<(string | undefined)[]>) {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
        }
    }

    dropBoard(event: CdkDragDrop<(string | undefined)[]>, x: number, y: number) {
        console.log(x, y);
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            console.log(event);
            console.log(event.container.data, event.currentIndex);
            if (this.grid[y][x] !== undefined) throw new Error('NOT EMPTY');
            this.grid[y][x] = event.previousContainer.data[event.previousIndex];
            event.previousContainer.data.splice(event.previousIndex, 1);
            // transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
        }

        console.log(this.grid);
    }

    ngAfterViewInit(): void {
        console.log(this.itemsList);
        this.dragAndDropService.registerTileRack(this.itemsList);
        this.dragAndDropService.registerTileRack(this.itemsList2);
    }
}
