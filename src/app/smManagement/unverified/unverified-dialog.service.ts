import { inject, Injectable } from '@angular/core';
import { VmDialogService } from '@vm-utils/dialogs';
import {
  AppMusicSheetDeleteDialog,
  DeleteMusicSheetDialogData,
} from './deleteDialog';
import { AppMusicSheetDataDialog, EditMusicSheetDialogData } from './dataDialog/music-sheet-data-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class UnverifiedDialogService {
  readonly #dialogService = inject(VmDialogService);

  async openEditMusicSheetDialog(data: EditMusicSheetDialogData): Promise<boolean | undefined> {
    return this.#dialogService.open(AppMusicSheetDataDialog, {
      data,
      title: 'Notenblatt bearbeiten',
      buttons: [
        { key: 'close', text: 'Abbrechen', type: 'elevated' },
        { key: 'save', text: 'Speichern', type: 'filled' },
      ],
    });
  }

  async openDeleteMusicSheetDialog(
    data: DeleteMusicSheetDialogData,
  ): Promise<boolean | undefined> {
    return this.#dialogService.open(AppMusicSheetDeleteDialog, {
      data,
      title: 'Notenblatt löschen',
      buttons: [
        { key: 'close', text: 'Abbrechen', type: 'elevated' },
        { key: 'delete', text: 'Löschen', type: 'filled', color: 'error' },
      ],
    });
  }
}


