import { Component, inject } from '@angular/core';
import { Role, RoleService } from './role.service';
import { BehaviorSubject, switchMap } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { VmColumn, VmRowClickedEvent, VmToolbarItem, VmcDataGrid, VmcToolbar } from '@vm-components';
import { RoleDialogService } from './role-dialog.service';

@Component({
  selector: 'app-roles',
  imports: [AsyncPipe, VmcDataGrid, VmcToolbar],
  templateUrl: './app-roles.component.html',
  styleUrl: './app-roles.component.scss',
})
export class AppRoles {
  readonly #roleService = inject(RoleService);
  readonly #roleDialogService = inject(RoleDialogService);

  #reload = new BehaviorSubject(false);
  roles$ = this.#reload
    .pipe(switchMap((_x) => this.#roleService.load$()));

  items: VmToolbarItem[] = [
    {
      key: 'addRole',
      icon: 'add',
      label: 'Neue Role',
      acton: async (): Promise<void> => {
        await this.#roleDialogService.openCreateRoleDialog();
        this.#reload.next(true);
      },
    },
  ];

  async execAction(action: VmRowClickedEvent<Role>): Promise<void> {
    if (action.rowData === null) {
      return;
    }
    if (action.key === 'edit') {
      const reload = await this.#roleDialogService.openEditRoleDialog(action.rowData);
      if (reload) {
        this.#reload.next(true);
      }
      return;
    }

    if (action.key === 'delete') {
      const reload = await this.#roleDialogService.openDeleteRoleDialog(action.rowData);
      if (reload) {
        this.#reload.next(true);
      }
    }
  }

  columns: VmColumn<Role>[] = [
    { key: 'groupId', header: '', field: 'roleId' },
    { key: 'name', header: 'Name', field: 'name' },
    { key: 'updatedAt', header: 'Geändert am', field: 'updatedAt', type: 'date' },
    { key: 'createdAt', header: 'Erstellt am', field: 'createdAt', type: 'date' },
    { key: 'updatedBy', header: 'Geändert von', field: 'updatedBy' },
    { key: 'createdBy', header: 'Erstellt von', field: 'createdBy' },
  ];
}
