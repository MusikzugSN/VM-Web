import {inject, Injectable} from '@angular/core';
import {VmDialogService} from '@vm-utils';
import {AppEditGroupDialog} from './app-edit-group-dialog.component';
import {IGroup} from '../group.service';

@Injectable({
  providedIn: 'root'
})
export class EditGroupDiaogService {
  readonly #dialogService = inject(VmDialogService)

  async openEditGroupDialog(data: IGroup) {
    return this.#dialogService.open(AppEditGroupDialog, {
      data: data,
      title: 'Gruppe bearbeiten',
      buttons: [
        { key: 'close', text: 'Abbrechen', type: 'elevated' },
        { key: 'save', text: 'Speichern', type: 'filled' }
      ]
    })
  }

}
