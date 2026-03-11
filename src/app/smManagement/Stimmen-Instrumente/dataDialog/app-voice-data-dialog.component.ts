import { Component, inject } from '@angular/core';
import {
  Dictionary,
  nameOf,
} from '@vm-utils';
import { Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { VmcInputField, VmFormField, VmSelectOption, VmValidFormTypes } from '@vm-components';
import { Voice, VoiceService } from '../voice.service';
import { InstrumentService } from '../instrumente.service';
import {DIALOG_BUTTON_CLICKS, DIALOG_DATA, DialogBase} from '@vm-utils/dialogs';

export interface VoiceDialogData {
  voice?: Voice;
  instrumentOptions: VmSelectOption[];
}

@Component({
  selector: 'app-voice-data-dialog',
  imports: [VmcInputField],
  templateUrl: './app-voice-data-dialog.component.html',
  styleUrl: './app-voice-data-dialog.component.scss',
})
export class AppVoiceDataDialog extends DialogBase<boolean> {
  readonly #data = inject<VoiceDialogData | undefined>(DIALOG_DATA);
  readonly #buttonClickEvents$ = inject<Observable<string | null>>(DIALOG_BUTTON_CLICKS);
  readonly #voiceService = inject(VoiceService);
  readonly #instrumentService = inject(InstrumentService);

  nameField: VmFormField = {
    label: 'Name',
    type: 'text',
    key: nameOf<Voice>('name'),
    value: this.#data?.voice?.name ?? '',
    placeholder: 'z. B. 1',
  };

  instrumentField: VmFormField = {
    label: 'Instrument',
    type: 'select',
    key: nameOf<Voice>('instrumentId'),
    value: this.#data?.voice?.instrumentId?.toString() ?? '',
    options: this.#data?.instrumentOptions ?? [],
  };

  countField: VmFormField = {
    label: 'Anzahl der Notenblätter',
    type: 'number',
    key: nameOf<Voice>('countOfMusicsheets'),
    value: this.#data?.voice?.countOfMusicsheets ?? '',
  };

  #changedValues: Dictionary<string> = {};

  constructor() {
    super();
    this.#buttonClickEvents$.pipe(takeUntilDestroyed()).subscribe(async (x) => {
      if (x === 'create') {
        const name = (this.#changedValues['name'] ?? '') as string;
        const instrumentIdStr = (this.#changedValues['instrumentId'] ?? '') as string;
        const countStr = (this.#changedValues['countOfMusicsheets'] ?? '0') as string;

        if (name && instrumentIdStr) {
          const instrumentId = parseInt(instrumentIdStr, 10);
          const instrument = this.#instrumentService.instrumentListe.find(
            (i) => i.instrumentId === instrumentId,
          );
          const instrumentName = instrument?.name ?? '';
          const countOfMusicsheets = parseInt(countStr, 10) || 0;

          this.#voiceService.addVoice(name, instrumentId, instrumentName, countOfMusicsheets);
        }
        super.closeDialog(true);
        return;
      }

      if (x === 'close') {
        super.closeDialog(false);
      }
    });
  }

  storeChangedValue(newValue: VmValidFormTypes, key: string): void {
    this.#changedValues[key] = newValue as string;
  }
}



