import { Component, inject } from '@angular/core';
import {
  convertToPatch,
  Dictionary,
  nameOf,
} from '@vm-utils';
import { firstValueFrom, Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { VmcInputField, VmInputField, VmValidFormTypes } from '@vm-components';
import { Instrument, InstrumentService } from '@vm-utils/services';
import { DIALOG_BUTTON_CLICKS, DIALOG_DATA, DialogBase } from '@vm-utils/dialogs';
import { SnackbarService } from '@vm-utils/snackbar';

const LETTERS_ONLY = /^[a-zA-ZäöüÄÖÜß\s]*$/;

@Component({
  selector: 'app-instrument-data-dialog',
  imports: [VmcInputField],
  templateUrl: './app-instrument-data-dialog.component.html',
  styleUrl: './app-instrument-data-dialog.component.scss',
})
export class AppInstrumentDataDialog extends DialogBase<boolean> {
  readonly #data = inject<Instrument | undefined>(DIALOG_DATA);
  readonly #buttonClickEvents$ = inject<Observable<string | null>>(DIALOG_BUTTON_CLICKS);
  readonly #instrumentService = inject(InstrumentService);
  readonly #snackbar = inject(SnackbarService);

  nameField: VmInputField = {
    label: 'Name',
    type: 'text',
    key: nameOf<Instrument>('name'),
    value: this.#data?.name ?? '',
    maxLength: 48,
  };

  typeField: VmInputField = {
    label: 'Instrumentenart',
    type: 'text',
    key: nameOf<Instrument>('type'),
    value: this.#data?.type ?? '',
    maxLength: 48,
  };

  #changedValues: Dictionary<string> = {};

  constructor() {
    super();
    this.#buttonClickEvents$.pipe(takeUntilDestroyed()).subscribe(async (x) => {
      const patch = convertToPatch<Instrument, string>(this.#changedValues);

      if (x === 'create') {
        const name = (this.#changedValues['name'] ?? '') as string;
        const type = (this.#changedValues['type'] ?? '') as string;

        if (!LETTERS_ONLY.test(name) || !LETTERS_ONLY.test(type)) {
          this.#snackbar.raiseError('Nur Buchstaben (inkl. ä, ö, ü, ß) und Leerzeichen sind erlaubt.');
          this.nameField = { ...this.nameField, value: '' };
          this.typeField = { ...this.typeField, value: '' };
          this.#changedValues = {};
          return;
        }

        await firstValueFrom(this.#instrumentService.create$(patch));
        super.closeDialog(true);
        return;
      }

      if (x === 'save') {
        patch.instrumentId = this.#data?.instrumentId ?? -1;
        await firstValueFrom(this.#instrumentService.change$(patch, patch.instrumentId));
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

