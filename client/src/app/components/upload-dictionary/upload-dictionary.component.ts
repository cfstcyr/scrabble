import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DictionaryData } from '@app/classes/dictionary/dictionary-data';
import { WRONG_FILE_TYPE } from '@app/constants/dictionaries-components';
import { DictionariesService } from '@app/services/dictionaries-service/dictionaries.service';
import { UploadState } from './upload-dictionary.component.types';

@Component({
    selector: 'app-upload-dictionary',
    templateUrl: 'upload-dictionary.component.html',
    styleUrls: ['upload-dictionary.component.scss'],
})
export class UploadDictionaryComponent {
    errorMessage: string = '';
    isDictionaryReady: boolean = false;
    state: UploadState = UploadState.Init;
    selectedFile: File;
    newDictionary: DictionaryData;
    constructor(private dialogRef: MatDialogRef<UploadDictionaryComponent>, private dictionariesService: DictionariesService) {}

    // This explicit-any exclusion is necessary since the event has no specific type nor can be cast to one as this method is called.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onFileChanged(event: any): void {
        this.selectedFile = event.target.files[0];
        const fileReader = new FileReader();
        fileReader.readAsText(this.selectedFile, 'UTF-8');
        if (this.selectedFile.type === 'application/json') {
            fileReader.onload = () => {
                try {
                    this.newDictionary = JSON.parse(fileReader.result as string) as DictionaryData;
                    this.isDictionaryReady = true;
                    this.errorMessage = '';
                    this.state = UploadState.Ready;
                } catch (error) {
                    const newError = error as SyntaxError;
                    this.errorMessage = newError.message;
                    this.state = UploadState.Error;
                }
            };
        } else {
            this.errorMessage = WRONG_FILE_TYPE;
            this.isDictionaryReady = false;
            this.state = UploadState.Error;
        }
    }

    onUpload(): void {
        this.dictionariesService.uploadDictionary(this.newDictionary);
        this.dialogRef.close();
    }

    closeDialog(): void {
        this.dialogRef.close();
    }
}
