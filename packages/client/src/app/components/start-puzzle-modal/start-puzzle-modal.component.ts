import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { IconName } from '@app/components/icon/icon.component.type';

export interface StartPuzzleModalParameters {
    onStart: (time: number) => void;
    onCancel: () => void;
    defaultTime: number;
}

interface PuzzleLevel {
    id: string;
    name: string;
    description: string;
    time: number;
    icons: IconName[];
}

const PUZZLE_LEVELS: PuzzleLevel[] = [
    {
        id: '1',
        name: 'Expert',
        description: '30 sec',
        time: 30,
        icons: ['bolt', 'bolt', 'bolt'],
    },
    {
        id: '2',
        name: 'Avancé',
        description: '2 min',
        time: 120,
        icons: ['bolt', 'bolt'],
    },
    {
        id: '3',
        name: 'Débutant',
        description: '5 min',
        time: 300,
        icons: ['bolt'],
    },
];

@Component({
    selector: 'app-start-puzzle-modal',
    templateUrl: './start-puzzle-modal.component.html',
    styleUrls: ['./start-puzzle-modal.component.scss'],
})
export class StartPuzzleModalComponent {
    timeField: FormControl;
    levels = PUZZLE_LEVELS;

    constructor(
        @Inject(MAT_DIALOG_DATA) private parameters: Partial<StartPuzzleModalParameters>,
        private readonly dialogRef: MatDialogRef<StartPuzzleModalComponent>,
        private readonly formBuilder: FormBuilder,
    ) {
        this.timeField = this.formBuilder.control(parameters.defaultTime ?? PUZZLE_LEVELS[0].time, Validators.required);
    }

    onConfirm() {
        if (this.timeField.invalid) return;
        this.dialogRef.close();
        this.parameters.onStart?.(this.timeField.value);
    }

    onCancel() {
        this.dialogRef.close();
        this.parameters.onCancel?.();
    }
}
