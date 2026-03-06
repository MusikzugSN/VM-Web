import { Component, inject } from '@angular/core';
import {
  DIALOG_BUTTON_CLICKS,
  DIALOG_DATA,
  DialogBase,
  Dictionary,
  nameOf,
  SnackbarService,
} from '@vm-utils';
import { Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { VmcInputField, VmInputField, VmValidFormTypes } from '@vm-components';
import { Instrument, InstrumentService } from '../instrumente.service';

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
  };

  typeField: VmInputField = {
    label: 'Instrumentenart',
    type: 'text',
    key: nameOf<Instrument>('type'),
    value: this.#data?.type ?? '',
  };

  #changedValues: Dictionary<string> = {};

  constructor() {
    super();
    this.#buttonClickEvents$.pipe(takeUntilDestroyed()).subscribe(async (x) => {
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

        if (name && type) {
          this.#instrumentService.addInstrument(name, type);
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

