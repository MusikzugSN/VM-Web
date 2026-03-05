import { inject, Injectable } from '@angular/core';
import { VmDialogService } from '@vm-utils';
import {VmpPrintDialog} from './print-dialog/vmp-print-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class PrintDialogService {
  readonly #dialogService = inject(VmDialogService);

  async openPrintDialog(): Promise<boolean | undefined> {
    console.log('Opening print dialog');
    return this.#dialogService.open(VmpPrintDialog, {
      data: undefined,
      title: 'Drucken',
      buttons: [
        { key: 'close', text: 'Abbrechen', type: 'elevated' },
        { key: 'print', text: 'Drucken', type: 'filled' },
      ],
    });
  }
}

