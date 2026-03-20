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
  alternativeVoiceOptions: VmSelectOption[];
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
    label: 'Nummer der Stimme',
    type: 'text',
    key: nameOf<Voice>('name'),
    value: this.#data?.voice?.name ?? '',
    placeholder: 'z. B. 1',
    maxLength: 4,
  };

  instrumentField: VmFormField = {
    label: 'Instrument',
    type: 'select',
    key: nameOf<Voice>('instrumentId'),
    value: this.#data?.voice?.instrumentId?.toString() ?? '',
    options: this.#data?.instrumentOptions ?? [],
  };

  alternativeVoiceField: VmFormField = {
    label: 'Alternative Stimme',
    type: 'select',
    key: nameOf<Voice>('alternativeVoiceId'),
    value: (this.#data?.voice?.alternativeVoiceId ?? this.#data?.voice?.alternateVoiceIds?.[0])?.toString() ?? '',
    options: this.#data?.alternativeVoiceOptions ?? [],
  };

  constructor() {
    super();
    this.#buttonClickEvents$.pipe(takeUntilDestroyed()).subscribe(async (x) => {
      const filtered: Dictionary<string> = Object.fromEntries(
        Object.entries(this.changedValues).filter(([_, v]) => v !== '' && v !== undefined)
      );
      const patch = convertToPatch<Voice, string>(filtered);

      if (patch.instrumentId !== undefined) {
        patch.instrumentId = Number(patch.instrumentId) as never;
      }
      if (patch.alternativeVoiceId !== undefined) {
        const altId = Number(patch.alternativeVoiceId);
        patch.alternateVoiceIds = [altId] as never;
        delete (patch as { alternativeVoiceId?: unknown }).alternativeVoiceId;
      }

      if (x === 'save') {
        patch.voiceId = this.#data?.voice?.voiceId ?? -1;
        await firstValueFrom(this.#voiceService.change$(patch, patch.voiceId));
        super.closeDialog(true);
        return;
      }

      if (x === 'create') {
        try {
          await firstValueFrom(this.#voiceService.create$(patch));
        } catch (err: unknown) {
          const httpErr = err as { status?: number };
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
