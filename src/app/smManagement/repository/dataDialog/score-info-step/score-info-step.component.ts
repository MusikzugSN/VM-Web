import { Component, inject, output } from '@angular/core';
import { DIALOG_DATA, nameOf } from '@vm-utils';
import { VmcInputField, VmFormField, VmValidFormTypes } from '@vm-components';
import { Score } from '../../score.service';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { ScoreDialogData } from '../app-score-data-dialog.component';

@Component({
  selector: 'app-score-info-step',
  imports: [VmcInputField, FormsModule, MatInput, MatLabel, MatFormField],
  templateUrl: './score-info-step.component.html',
  styleUrl: './score-info-step.component.scss',
})
export class ScoreInfoStepComponent {
  readonly #data = inject<ScoreDialogData | undefined>(DIALOG_DATA);

  valueChanged = output<{ key: string; value: string }>();

  durationDisplay = '';

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

  constructor() {
    if (this.#data?.score?.duration) {
      this.durationDisplay = this.#data.score.duration;
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
    this.valueChanged.emit({ key: 'duration', value: this.durationDisplay });
  }

  storeChangedValue(newValue: VmValidFormTypes, key: string): void {
    this.valueChanged.emit({ key, value: newValue as string });
  }
}


