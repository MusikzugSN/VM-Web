import { inject, Injectable } from '@angular/core';
import { VmDialogService } from '@vm-utils/dialogs';
import { VmpPrintDialog } from './print-dialog/vmp-print-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class PrintDialogService {
  readonly #dialogService = inject(VmDialogService);

  async openPrintDialog(selectedIds?: number[]): Promise<boolean | undefined> {
    console.log('Opening print dialog with selected notes:', selectedIds);
    return this.#dialogService.open(VmpPrintDialog, {
      data: { selectedIds },
      title: 'Drucken',
      buttons: [
        { key: 'close', text: 'Abbrechen', type: 'elevated' },
        { key: 'print', text: 'Drucken', type: 'filled' },
      ],
    });
  }
}
