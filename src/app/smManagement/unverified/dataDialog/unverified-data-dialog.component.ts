import { Component, inject } from '@angular/core';
import { convertToPatch, Dictionary, nameOf } from '@vm-utils';
import {
  FileData,
  VmcFileUploader,
  VmcInputField,
  VmFormField,
  VmValidFormTypes,
} from '@vm-components';
import { Score, ScoreService, Voice} from '@vm-utils/services';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { DIALOG_BUTTON_CLICKS, DIALOG_DATA, DialogBase } from '@vm-utils/dialogs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-unverified-data-dialog.component',
  imports: [VmcInputField, VmcFileUploader],
  templateUrl: './unverified-data-dialog.component.html',
  styleUrl: './unverified-data-dialog.component.scss',
})
export class UnverifiedDataDialog extends DialogBase<boolean> {
  readonly #dataScore = inject<Score | undefined>(DIALOG_DATA);
  readonly #dataVoice = inject<Voice | undefined>(DIALOG_DATA);
  readonly #buttonClickEvents$ = inject<Observable<string | null>>(DIALOG_BUTTON_CLICKS);
  readonly #ScoreService = inject(ScoreService);

  scoreField: VmFormField = {
    label: 'Stück',
    type: 'select',
    key: nameOf<Score>('scoreId'),
    value: this.#dataScore?.scoreId?.toString() ?? '',
    options: this.#dataScore
      ? [{ label: this.#dataScore.title, value: this.#dataScore.scoreId.toString() }]
      : [],
  };

  voiceField: VmFormField = {
    label: 'Stimme',
    type: 'select',
    key: nameOf<Voice>('voiceId'),
    value: this.#dataVoice?.voiceId?.toString() ?? '',
    options: this.#dataVoice
      ? [{ label: this.#dataVoice?.name, value: this.#dataVoice?.voiceId?.toString() ?? '' }]
      : [],
  };

  #files$ = new BehaviorSubject<FileData[]>([]);

  fileChangeEvent(files: FileData[]): void {
    this.#files$.next(files);
  }

  constructor() {
    super();
    this.#buttonClickEvents$.pipe(takeUntilDestroyed()).subscribe(async (x) => {
      const patch = convertToPatch<Score, string>(this.changedValues);
      if (x === 'save') {
        patch.scoreId = this.#dataScore?.scoreId ?? -1;
        await firstValueFrom(this.#ScoreService.change$(patch, patch.scoreId));
        super.closeDialog(true);
        return;
      }

      if (x === 'create') {
        await firstValueFrom(this.#ScoreService.create$(patch));
        super.closeDialog(true);
        return;
      }

      if (x === 'close') {
        super.closeDialog(false);
      }
    });
  }
  changedValues: Dictionary<string> = {};

  storeChangedValue(newValue: VmValidFormTypes, key: string): void {
    this.changedValues[key] = newValue as string;
  }
}
