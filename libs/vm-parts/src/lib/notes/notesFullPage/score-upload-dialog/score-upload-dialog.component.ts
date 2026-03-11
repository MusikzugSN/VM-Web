import { Component, inject, output, Signal } from '@angular/core';
import { DIALOG_DATA } from '@vm-utils';
import {
  FileData,
  VmcFileUploader,
  VmcInputField,
  VmFormField,
  VmValidFormTypes,
} from '@vm-components';
import { BehaviorSubject } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-score-upload-step',
  imports: [VmcInputField, VmcFileUploader],
  templateUrl: './score-upload-dialog.component.html',
  styleUrl: './score-upload-dialog.component.scss',
})
export class ScoreUploadDialogComponent {
  readonly #folderService = inject(FoldersService);

  valueChanged = output<{ key: string; value: string }>();

  scoreField: VmFormField = {
    label: 'Stück',
    type: 'select',
    key: 'folderId',
    value: '',
    options: this.#data?.folderOptions ?? [],
  };

  voiceField: VmFormField = {
    label: 'Stimme',
    type: 'select',
    key: 'voiceId',
    value: '',
    options: this.#data?.voiceOptions ?? [],
  };

  #files$ = new BehaviorSubject<FileData[]>([]);
  files: Signal<FileData[]> = toSignal<FileData[], FileData[]>(this.#files$, { initialValue: [] });

  fileChangeEvent(files: FileData[]): void {
    this.#files$.next(files);
  }

  storeChangedValue(newValue: VmValidFormTypes, key: string): void {
    this.valueChanged.emit({ key, value: newValue as string });
  }
}


