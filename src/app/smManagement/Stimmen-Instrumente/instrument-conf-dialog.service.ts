import { inject, Injectable } from '@angular/core';
import { VmDialogService } from '@vm-utils/dialogs';
import { AppInstrumentDataDialog } from './dataDialog/app-instrument-data-dialog.component';
import { Instrument } from '@vm-utils/services';
import { InstrumentDeleteDialog } from './deleteDialog/instrument-delete-dialog-component';

@Injectable({
  providedIn: 'root',
})
export class InstrumentConfDialogService {
  readonly #dialogService = inject(VmDialogService);

  async openDeleteInstrumentDialog(data: Instrument): Promise<boolean | undefined> {
    return this.#dialogService.open(InstrumentDeleteDialog, {
      data: data,
      title: 'Instrument löschen',
      buttons: [
        { key: 'close', text: 'Abbrechen', type: 'elevated' },
        { key: 'delete', text: 'Löschen', type: 'filled', color: 'error' },
      ],
    });
  }

  async openEditInstrumentDialog(data: Instrument): Promise<boolean | undefined> {
    return this.#dialogService.open(AppInstrumentDataDialog, {
      data: data,
      title: 'Instrument bearbeiten',
      buttons: [
        { key: 'close', text: 'Abbrechen', type: 'elevated' },
        { key: 'save', text: 'Speichern', type: 'filled' },
      ],
    });
  }

  async openNewInstrumentDialog(): Promise<boolean | undefined> {
    return this.#dialogService.open(AppInstrumentDataDialog, {
      data: undefined,
      title: 'Instrument erstellen',
      buttons: [
        { key: 'close', text: 'Abbrechen', type: 'elevated' },
        { key: 'create', text: 'Erstellen', type: 'filled' },
      ],
    });
  }
}
