import { inject, Injectable } from '@angular/core';
import { VmDialogService } from '@vm-utils/dialogs';
import { Tag } from '../../me/tags/Tag.service';
import { TagsDataDialog } from './dataDialog/tags-data-dialog.component';
import { TagsDeleteDialog } from './deleteDialog/tags-delete-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class TagDialogService {
  readonly #dialogService = inject(VmDialogService);

  async openDeleteTagDialog(data: Tag): Promise<boolean | undefined> {
    return this.#dialogService.open(TagsDeleteDialog, {
      data: data,
      title: 'Tag löschen',
      buttons: [
        { key: 'close', text: 'Abbrechen', type: 'elevated' },
        { key: 'delete', text: 'Löschen', type: 'filled', color: 'error' },
      ],
    });
  }
  async openEditTagDialog(data: Tag): Promise<boolean | undefined> {
    return this.#dialogService.open(TagsDataDialog, {
      data: data,
      title: 'Tag bearbeiten',
      buttons: [
        { key: 'close', text: 'Abbrechen', type: 'elevated' },
        { key: 'save', text: 'Speichern', type: 'filled' },
      ],
    });
  }
  async openNewTagDialog(): Promise<boolean | undefined> {
    return this.#dialogService.open(TagsDataDialog, {
      data: undefined,
      title: 'Tag erstellen',
      buttons: [
        { key: 'close', text: 'Abbrechen', type: 'elevated' },
        { key: 'create', text: 'Erstellen', type: 'filled' },
      ],
    });
  }
}
