import {inject, Injectable} from '@angular/core';
import {VmDialogService} from '@vm-utils';
import {AppGroupDataDialog} from './editDialog/app-group-data-dialog.component';
import {IGroup} from './group.service';
import {AppDeleteGroupDialog} from './deleteDialog/app-delete-group-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class GroupDialogService {
  readonly #dialogService = inject(VmDialogService)

  async openDeleteGroupDialog(data: IGroup) {
    return this.#dialogService.open(AppDeleteGroupDialog, {
      data: data,
      title: 'Gruppe löschen',
      buttons: [
        { key: 'close', text: 'Abbrechen', type: 'elevated' },
        { key: 'delete', text: 'Löschen', type: 'filled', color: 'error'}
      ]
    });
  }

  async openEditGroupDialog(data: IGroup) {
    return this.#dialogService.open(AppGroupDataDialog, {
      data: data,
      title: 'Gruppe bearbeiten',
      buttons: [
        { key: 'close', text: 'Abbrechen', type: 'elevated' },
        { key: 'save', text: 'Speichern', type: 'filled' }
      ]
    })
  }

  async openNewGroupDialog() {
    return this.#dialogService.open(AppGroupDataDialog, {
      data: undefined,
      title: 'Gruppe erstellen',
      buttons: [
        { key: 'close', text: 'Abbrechen', type: 'elevated' },
        { key: 'create', text: 'Erstellen', type: 'filled' }
      ]
    })
  }
}
