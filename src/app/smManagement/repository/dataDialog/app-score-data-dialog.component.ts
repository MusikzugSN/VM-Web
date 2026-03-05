import { Component, inject, Signal } from '@angular/core';
import {
  DIALOG_BUTTON_CLICKS,
  DIALOG_DATA,
  DialogBase,
  Dictionary,
  nameOf,
} from '@vm-utils';
import { BehaviorSubject, Observable } from 'rxjs';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  FileData,
  VmcFileUploader,
  VmcInputField,
  VmFormField,
  VmSelectOption,
  VmValidFormTypes,
} from '@vm-components';
import { Score } from '../score.service';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';


export interface ScoreDialogData {
  score?: Score;
  voiceOptions: VmSelectOption[];
  folderOptions: VmSelectOption[];
  simpleMode?: boolean;
  sheetMode?: boolean;
}

@Component({
  selector: 'app-score-data-dialog',
  imports: [VmcInputField, FormsModule, MatInput, MatLabel, MatFormField, VmcFileUploader],
  templateUrl: './app-score-data-dialog.component.html',
  styleUrl: './app-score-data-dialog.component.scss',
})
export class AppScoreDataDialog extends DialogBase<boolean> {
  readonly #data = inject<ScoreDialogData | undefined>(DIALOG_DATA);
  readonly #buttonClickEvents$ = inject<Observable<string | null>>(DIALOG_BUTTON_CLICKS);

  currentStep: number;
  durationDisplay = '';
  isDragOver = false;
  uploadedFiles: File[] = [];

  titleField: VmFormField = {
    label: 'Titel',
    type: 'text',
    key: nameOf<Score>('title'),
    value: this.#data?.score?.title ?? '',
    placeholder: 'z. B. Symphonie Nr. 5',
  };

  composerField: VmFormField = {
    label: 'Komponist',
    type: 'text',
    key: nameOf<Score>('composer'),
    value: this.#data?.score?.composer ?? '',
    placeholder: 'z. B. Ludwig van Beethoven',
  };

  linkField: VmFormField = {
    label: 'Link',
    type: 'url',
    key: nameOf<Score>('link'),
    value: this.#data?.score?.link ?? '',
    placeholder: 'z. B. https://example.com',
  };

  voiceField: VmFormField = {
    label: 'Stimme',
    type: 'select',
    key: 'voiceId',
    value: '',
    options: this.#data?.voiceOptions ?? [],
  };

  scoreField: VmFormField = {
    label: 'Notenstück',
    type: 'select',
    key: 'folderId',
    value: '',
    options: this.#data?.folderOptions ?? [],
  };

  #changedValues: Dictionary<string> = {};

  constructor() {
    super();
    this.currentStep = this.#data?.sheetMode ? 2 : 1;

    if (this.#data?.score?.duration) {
      this.durationDisplay = this.#data.score.duration;
    }

    this.#buttonClickEvents$.pipe(takeUntilDestroyed()).subscribe(async (x) => {
      if (x === 'create') {
        this.#changedValues['duration'] = this.durationDisplay;
        super.closeDialog(true);
        return;
      }

      if (x === 'close') {
        super.closeDialog(false);
      }
    });
  }

  onDurationInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let raw = input.value.replace(/[^0-9]/g, '');

    if (raw.length > 4) {
      raw = raw.substring(0, 4);
    }

    if (raw.length >= 2) {
      this.durationDisplay = raw.substring(0, 2) + ':' + raw.substring(2);
    } else {
      this.durationDisplay = raw;
    }

    input.value = this.durationDisplay;
    this.#changedValues['duration'] = this.durationDisplay;
  }

  storeChangedValue(newValue: VmValidFormTypes, key: string): void {
    this.#changedValues[key] = newValue as string;
  }

  #files$: BehaviorSubject<FileData[]> = new BehaviorSubject<FileData[]>([]);
  files: Signal<FileData[]> = toSignal<FileData[],FileData[]>(this.#files$, { initialValue: [] });
  fileChangeEvent(files: FileData[]): void {
    this.#files$.next(files);
  }
}

