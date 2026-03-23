import { inject, Injectable } from '@angular/core';
import { VmDialogService } from '@vm-utils/dialogs';
import { Score } from '@vm-utils/services';
import { AllNotesData } from '@vm-parts';
import { UnverifiedDataDialog } from './dataDialog/unverified-data-dialog.component';

import { UnverifiedDeleteDialog } from './deleteDialog/unverified-delete-dialog.component';

export interface DeleteNoteDialogData {
  note: AllNotesData;
}


@Injectable({
  providedIn: 'root',
})
export class UnverifiedDialogService {
  readonly #dialogService = inject(VmDialogService);

  async openEditScoreDialog(data: Score): Promise<boolean | undefined> {
    return this.#dialogService.open(UnverifiedDataDialog, {
      data: data,
      title: 'Notenblatt bearbeiten',
      buttons: [
        { key: 'close', text: 'Abbrechen', type: 'elevated' },
        { key: 'save', text: 'Speichern', type: 'filled' },
      ],
    });
  }
  async openDeleteScoreDialog(data: DeleteNoteDialogData): Promise<boolean | undefined> {
    return this.#dialogService.open(UnverifiedDeleteDialog, {
      data: data,
      title: 'Notenblatt löschen',
      buttons: [
        { key: 'close', text: 'Abbrechen', type: 'elevated' },
        { key: 'delete', text: 'Löschen', type: 'filled', color: 'error' },
      ],
    });
  }
}


