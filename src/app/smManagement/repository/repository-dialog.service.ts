import { inject, Injectable } from '@angular/core';
import { VmDialogService } from '@vm-utils';
import { AppScoreDataDialog, ScoreDialogData } from './dataDialog/app-score-data-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class RepositoryDialogService {
  readonly #dialogService = inject(VmDialogService);

  async openScoreInfoDialog(): Promise<boolean | undefined> {
    return this.#dialogService.open<boolean, ScoreDialogData>(AppScoreDataDialog, {
      title: 'Stück hinzufügen',
      data: {
        voiceOptions: [],
        folderOptions: [],
        simpleMode: true,
      },
      buttons: [
        { key: 'close', text: 'Abbrechen', type: 'elevated' },
        { key: 'create', text: 'Hinzufügen', type: 'filled' },
      ],
      dialogConfig: {
        minWidth: '600px',
      },
    });
  }
}

