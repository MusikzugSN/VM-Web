import { Component, inject } from '@angular/core';
import {
  VmColumn,
  VmRowClickedEvent,
  VmcDataGrid,
  VmcToolbar,
  VmToolbarItem,
} from '@vm-components';
import { GroupService, Group } from './group.service';
import { BehaviorSubject, Observable, switchMap } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { GroupDialogService } from './group-dialog.service';

@Component({
  selector: 'app-groups',
  imports: [VmcDataGrid, AsyncPipe, VmcToolbar],
  templateUrl: './app-groups.component.html',
  styleUrl: './app-groups.component.scss',
})
export class AppGroups {
  readonly #groupService = inject(GroupService);
  readonly #groupDataDialogService = inject(GroupDialogService);

  #reload = new BehaviorSubject(false);

  items: VmToolbarItem[] = [
    {
      key: 'addGroup',
      icon: 'add',
      label: 'Neue Gruppe',
      acton: async (): Promise<void> => {
        await this.#groupDataDialogService.openNewGroupDialog();
        this.#reload.next(true);
      },
    },
  ];

  async execAction(action: VmRowClickedEvent<Group>): Promise<void> {
    if (action.rowData === null) {
      return;
    }

    if (action.key === 'edit') {
      const reload = await this.#groupDataDialogService.openEditGroupDialog(action.rowData);
      if (reload) {
        this.#reload.next(true);
      }
      return;
    }

    if (action.key === 'delete') {
      const reload = await this.#groupDataDialogService.openDeleteGroupDialog(action.rowData);
      if (reload) {
        this.#reload.next(true);
      }
    }
  }

  data$: Observable<Group[]> = this.#reload.pipe(switchMap((_x) => this.#groupService.load$()));

  columns: VmColumn<Group>[] = [
    { key: 'groupId', header: '', field: 'groupId' },
    { key: 'name', header: 'Name', field: 'name' },
    { key: 'updatedAt', header: 'Geändert am', field: 'updatedAt', type: 'date' },
    { key: 'createdAt', header: 'Erstellt am', field: 'createdAt', type: 'date' },
    { key: 'updatedBy', header: 'Geändert von', field: 'updatedBy' },
    { key: 'createdBy', header: 'Erstellt von', field: 'createdBy' },
  ];
}
