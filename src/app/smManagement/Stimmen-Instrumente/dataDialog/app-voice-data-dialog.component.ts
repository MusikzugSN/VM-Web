import { Component, inject } from '@angular/core';
import {
  convertToPatch,
  Dictionary,
  nameOf,
} from '@vm-utils';
import { firstValueFrom, Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { VmcInputField, VmFormField, VmSelectOption, VmValidFormTypes } from '@vm-components';
import { Voice, VoiceService } from '@vm-utils/services';
import { DIALOG_BUTTON_CLICKS, DIALOG_DATA, DialogBase } from '@vm-utils/dialogs';

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
  readonly #voiceService = inject(VoiceService);
  readonly #buttonClickEvents$ = inject<Observable<string | null>>(DIALOG_BUTTON_CLICKS);

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

  constructor() {
    super();
    this.#buttonClickEvents$.pipe(takeUntilDestroyed()).subscribe(async (x) => {
      // Leere Strings entfernen bevor der Patch erstellt wird
      const filtered: Dictionary<string> = Object.fromEntries(
        Object.entries(this.changedValues).filter(([_, v]) => v !== '' && v !== undefined)
      );
      const patch = convertToPatch<Voice, string>(filtered);

      // Numerische Felder konvertieren (Backend erwartet number, nicht string)
      if (patch.instrumentId !== undefined) {
        patch.instrumentId = Number(patch.instrumentId) as never;
      }
      if (patch.countOfMusicsheets !== undefined) {
        patch.countOfMusicsheets = Number(patch.countOfMusicsheets) as never;
      }

      if (x === 'save') {
        patch.voiceId = this.#data?.voice?.voiceId ?? -1;
        console.log('Voice SAVE patch:', JSON.stringify(patch));
        await firstValueFrom(this.#voiceService.change$(patch, patch.voiceId));
        super.closeDialog(true);
        return;
      }

      if (x === 'create') {
        console.log('Voice CREATE patch:', JSON.stringify(patch));
        try {
          await firstValueFrom(this.#voiceService.create$(patch));
        } catch (err: unknown) {
          const httpErr = err as { status?: number };
          // 303 = Backend hat erstellt, antwortet aber mit Redirect
          if (httpErr?.status !== 303) {
            throw err;
          }
        }
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


