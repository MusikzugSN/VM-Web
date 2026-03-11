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
import { ScoreDialogData } from '../../../../../../../src/app/smManagement/repository/dataDialog/app-score-data-dialog.component';

@Component({
  selector: 'app-score-upload-step',
  imports: [VmcInputField, VmcFileUploader],
  templateUrl: './score-upload-step.component.html',
  styleUrl: './score-upload-step.component.scss',
})
export class ScoreUploadStepComponent {
  readonly #data = inject<ScoreDialogData | undefined>(DIALOG_DATA);

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


