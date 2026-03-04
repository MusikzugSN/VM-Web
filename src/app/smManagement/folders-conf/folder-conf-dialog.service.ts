import { inject, Injectable } from '@angular/core';
import { VmDialogService } from '@vm-utils';
import { AppFolderDataDialog } from './folder-data-dialog.component/app-folder-data-dialog.component';
import { AppDeleteGroupDialog } from '../../admin/goups/deleteDialog/app-delete-group-dialog.component';
import { Folder } from '../../me/folders/folders.service';

@Injectable({
  providedIn: 'root',
})
export class FolderDialogService {
  readonly #dialogService = inject(VmDialogService);

  async openDeleteFolderDialog(data: Folder): Promise<boolean | undefined> {
    return this.#dialogService.open(AppDeleteGroupDialog, {
      data: data,
      title: 'Mappe löschen',
      buttons: [
        { key: 'close', text: 'Abbrechen', type: 'elevated' },
        { key: 'delete', text: 'Löschen', type: 'filled', color: 'error' },
      ],
    });
  }

  async openEditFolderDialog(data: Folder): Promise<boolean | undefined> {
    return this.#dialogService.open(AppFolderDataDialog, {
      data: data,
      title: 'Mappe bearbeiten',
      buttons: [
        { key: 'close', text: 'Abbrechen', type: 'elevated' },
        { key: 'save', text: 'Speichern', type: 'filled' },
      ],
    });
  }
  async openNewFolderDialog(): Promise<boolean | undefined> {
    return this.#dialogService.open(AppFolderDataDialog, {
      data: undefined,
      title: 'Mappe erstellen',
      buttons: [
        { key: 'close', text: 'Abbrechen', type: 'elevated' },
        { key: 'create', text: 'Erstellen', type: 'filled' },
      ],
    });
  }
}
