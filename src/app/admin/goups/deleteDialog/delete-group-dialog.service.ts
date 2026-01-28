import {inject, Injectable} from '@angular/core';
import {VmDialogService} from '@vm-utils';
import {IGroup} from '../group.service';
import {AppDeleteGroupDialog} from './app-delete-group-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class DeleteGroupDialogService {
  readonly #dialogService = inject(VmDialogService)

  async openEditGroupDialog(data: IGroup) {
    return this.#dialogService.open(AppDeleteGroupDialog, {
      data: data,
      title: 'Gruppe löschen',
      buttons: [
        { key: 'close', text: 'Abbrechen', type: 'elevated' },
        { key: 'delete', text: 'Löschen', type: 'filled', color: 'error'}
      ]
    })
  }

}
