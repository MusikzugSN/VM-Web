import { Component, inject } from '@angular/core';
import {
  convertToDisplayMinutes, convertToDurationValue,
  convertToPatch,
  Dictionary,
  nameOf
} from '@vm-utils';
import {VmcInputField, VmFormField, VmValidFormTypes} from '@vm-components';
import {Score, ScoreService} from '../score.service';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {firstValueFrom, Observable} from 'rxjs';
import {DIALOG_BUTTON_CLICKS, DIALOG_DATA, DialogBase} from '@vm-utils/dialogs';

@Component({
  selector: 'app-score-info-step',
  imports: [VmcInputField, FormsModule, MatInput, MatLabel, MatFormField],
  templateUrl: './app-repository-data-dialog.component.html',
  styleUrl: './app-repository-data-dialog.component.scss',
})
export class AppRepositoryDataDialog extends DialogBase<boolean> {
  readonly #data = inject<Score | undefined>(DIALOG_DATA);
  readonly #buttonClickEvents$ = inject<Observable<string | null>>(DIALOG_BUTTON_CLICKS);

  readonly #scoreService = inject(ScoreService);

  #changedValues: Dictionary<string> = {};

  durationDisplay = '';

  titleField: VmFormField = {
    label: 'Titel',
    type: 'text',
    key: nameOf<Score>('title'),
    value: this.#data?.title ?? '',
    placeholder: 'z. B. Pirates of the Caribbean',
    required: true
  };

  composerField: VmFormField = {
    label: 'Komponist',
    type: 'text',
    key: nameOf<Score>('composer'),
    value: this.#data?.composer ?? '',
    placeholder: 'z. B. Hans Zimmer',
    required: true
  };

  linkField: VmFormField = {
    label: 'Link',
    type: 'url',
    key: nameOf<Score>('link'),
    value: this.#data?.link ?? 'https://',
    placeholder: 'z. B. https://youtube.com/',
  };

  constructor() {
    super();

    this.#buttonClickEvents$.pipe(takeUntilDestroyed()).subscribe(async (x) => {
      const patch = convertToPatch<Score, VmValidFormTypes >(this.#changedValues);
      if (x === 'save') {
        patch.scoreId = this.#data?.scoreId ?? -1;
        await firstValueFrom(this.#scoreService.change$(patch, patch.scoreId));
        super.closeDialog(true);
        return;
      }

      if (x === 'create') {
        await firstValueFrom(this.#scoreService.create$(patch));
        super.closeDialog(true);
        return;
      }

      if (x === 'close') {
        super.closeDialog(false);
      }
    });

    if (this.#data?.duration) {
      this.durationDisplay = convertToDisplayMinutes(this.#data?.duration ?? 0);
    }
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
    this.storeChangedValue(convertToDurationValue(this.durationDisplay), 'duration');
  }

  storeChangedValue(value: string| number, key: string): void {
    this.#changedValues[key] = value.toString();
  }
}


