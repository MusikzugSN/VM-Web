import { inject, Injectable } from '@angular/core';
import { VmDialogService } from '@vm-utils/dialogs';
import { VmpPrintDialog } from './print-dialog/vmp-print-dialog.component';
import {VmpScoreUploadDialogComponent} from './score-upload-dialog/vmp-score-upload-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class VmpNotesFullpageDialogService {
  readonly #dialogService = inject(VmDialogService);

  async openPrintDialog(selectedIds?: number[]): Promise<boolean | undefined> {
    return this.#dialogService.open(VmpPrintDialog, {
      data: { selectedIds },
      title: 'Drucken',
      buttons: [
        { key: 'close', text: 'Abbrechen', type: 'elevated' },
        { key: 'print', text: 'Drucken', type: 'filled' },
      ],
    });
  }

  async openAddNoteSheetDialog(): Promise<boolean | undefined> {
    return this.#dialogService.open(VmpScoreUploadDialogComponent, {
      data: undefined,
      title: 'Notenblatt hinzufügen',
      buttons: [
        { key: 'close', text: 'Abbrechen', type: 'elevated' },
        { key: 'upload', text: 'Hinzufügen', type: 'filled' },
      ],
    });
  }
}
