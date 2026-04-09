import { inject, Injectable } from '@angular/core';
import { VmDialogService } from '@vm-utils/dialogs';
import { Instrument } from '@vm-utils/services';
import { AppInstrumentDataDialog } from './dataDialog/app-instrument-data-dialog.component';
import { InstrumentDeleteDialog } from './deleteDialog/instrument-delete-dialog-component';

@Injectable({
  providedIn: 'root',
})
export class InstrumentDialogService {
  readonly #dialogService = inject(VmDialogService);

  async openAddInstrumentDialog(): Promise<boolean | undefined> {
    return this.#dialogService.open<boolean, Instrument>(AppInstrumentDataDialog, {
      title: 'Instrument hinzufügen',
      data: undefined,
      buttons: [
        { key: 'close', text: 'Abbrechen', type: 'elevated' },
        { key: 'create', text: 'Hinzufügen', type: 'filled' },
      ],
      dialogConfig: {
        minWidth: '500px',
      },
    });
  }

  async openEditInstrumentDialog(data: Instrument): Promise<boolean | undefined> {
    return this.#dialogService.open<boolean, Instrument>(AppInstrumentDataDialog, {
      title: 'Instrument bearbeiten',
      data: data,
      buttons: [
        { key: 'close', text: 'Abbrechen', type: 'elevated' },
        { key: 'save', text: 'Speichern', type: 'filled' },
      ],
      dialogConfig: {
        minWidth: '500px',
      },
    });
  }

  async openDeleteInstrumentDialog(data: Instrument): Promise<boolean | undefined> {
    return this.#dialogService.open<boolean, Instrument>(InstrumentDeleteDialog, {
      title: 'Instrument löschen',
      data: data,
      buttons: [
        { key: 'close', text: 'Abbrechen', type: 'elevated' },
        { key: 'delete', text: 'Löschen', type: 'filled', color: 'error' },
      ],
    });
  }
}
