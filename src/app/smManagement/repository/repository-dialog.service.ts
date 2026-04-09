import { inject, Injectable } from '@angular/core';
import { VmDialogService } from '@vm-utils/dialogs';
import { Score } from '@vm-utils/services';
import { AppRepositoryDataDialog } from './dataDialog/app-repository-data-dialog.component';
import { AppScoreDeleteDialog } from './deleteDialog/app-score-delete-dialog.component';
import { AppScoreMulitCreateDialog } from './mulitCreateDialog/app-mulit-create-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class RepositoryDialogService {
  readonly #dialogService = inject(VmDialogService);

  async openNewScoreDialog(): Promise<boolean | undefined> {
    return this.#dialogService.open<boolean, Score>(AppRepositoryDataDialog, {
      title: 'Stück hinzufügen',
      data: undefined,
      buttons: [
        { key: 'close', text: 'Abbrechen', type: 'elevated' },
        { key: 'create', text: 'Hinzufügen', type: 'filled' },
      ],
      dialogConfig: {
        minWidth: '700px',
      },
    });
  }

  async openNewScoreMulitDialog(): Promise<boolean | undefined> {
    return this.#dialogService.open<boolean, Score>(AppScoreMulitCreateDialog, {
      title: 'Stücke hinzufügen',
      data: undefined,
      buttons: [
        { key: 'close', text: 'Abbrechen', type: 'elevated' },
        { key: 'create', text: 'Hinzufügen', type: 'filled' },
      ],
      dialogConfig: {
        minWidth: '600px',
      },
    });
  }

  async openEditScoreDialog(score: Score): Promise<boolean | undefined> {
    return this.#dialogService.open<boolean, Score>(AppRepositoryDataDialog, {
      title: 'Stück bearbeiten',
      data: score,
      buttons: [
        { key: 'close', text: 'Abbrechen', type: 'elevated' },
        { key: 'save', text: 'Speichern', type: 'filled' },
      ],
      dialogConfig: {
        minWidth: '700px',
      },
    });
  }

  async openDeleteScoreDialog(score: Score): Promise<boolean | undefined> {
    return this.#dialogService.open<boolean, Score>(AppScoreDeleteDialog, {
      title: 'Stück löschen',
      data: score,
      buttons: [
        { key: 'close', text: 'Abbrechen', type: 'elevated' },
        { key: 'delete', text: 'Löschen', type: 'filled', color: 'error' },
      ],
      dialogConfig: {
        minWidth: '600px',
      },
    });
  }
}
