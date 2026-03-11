import { inject, Injectable } from '@angular/core';
import { VmDialogService } from '@vm-utils/dialogs';
import { Instrument } from './instrumente.service';
import { AppInstrumentDataDialog } from './dataDialog/app-instrument-data-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class InstrumentDialogService {
  readonly #dialogService = inject(VmDialogService);

  async openAddInstrumentDialog(): Promise<boolean | undefined> {
    return this.#dialogService.open<boolean, Instrument>(AppInstrumentDataDialog, {
      title: 'Instrument hinzufügen',
      buttons: [
        { key: 'close', text: 'Abbrechen', type: 'elevated' },
        { key: 'create', text: 'Hinzufügen', type: 'filled' },
      ],
      dialogConfig: {
        minWidth: '500px',
      },
    });
  }
}

