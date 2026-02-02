import { Component, inject } from '@angular/core';
import { IRole, RolesService } from './roles.service';
import { BehaviorSubject, switchMap } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { IColumn, IRowClickedEvent, IToolbarItem, VmcDataGrid, VmcToolbar } from '@vm-components';
import { RoleDialogService } from './role-dialog.service';

@Component({
  selector: 'app-roles',
  imports: [AsyncPipe, VmcDataGrid, VmcToolbar],
  templateUrl: './app-roles.component.html',
  styleUrl: './app-roles.component.scss',
})
export class AppRoles {
  readonly #roleService = inject(RolesService);
  readonly #roleDialogService = inject(RoleDialogService);

  #reload = new BehaviorSubject(false);
  roles$ = this.#reload.pipe(switchMap((_x) => this.#roleService.load$()));

  items: IToolbarItem[] = [
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

  async execAction(action: IRowClickedEvent<IRole>): Promise<void> {
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

  columns: IColumn<IRole>[] = [
    { key: 'groupId', header: '', field: 'roleId' },
    { key: 'name', header: 'Name', field: 'name' },
    { key: 'updatedAt', header: 'Geändert am', field: 'updatedAt', type: 'date' },
    { key: 'createdAt', header: 'Erstellt am', field: 'createdAt', type: 'date' },
    { key: 'updatedBy', header: 'Geändert von', field: 'updatedBy' },
    { key: 'createdBy', header: 'Erstellt von', field: 'createdBy' },
  ];
}
