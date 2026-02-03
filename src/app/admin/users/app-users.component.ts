import {Component, inject} from '@angular/core';
import {User, UserService} from './user.service';
import {UserDialogService} from './user-dialog.service';
import {VmColumn, VmToolbarItem, VmcDataGrid, VmcIconButton, VmcToolbar} from '@vm-components';
import {AsyncPipe} from '@angular/common';
import {BehaviorSubject, Observable, switchMap} from 'rxjs';

@Component({
  selector: 'app-users',
  imports: [
    VmcToolbar,
    VmcDataGrid,
    AsyncPipe,
    VmcIconButton
  ],
  templateUrl: './app-users.component.html',
  styleUrl: './app-users.component.scss',
})
export class AppUsers {
  readonly #userService = inject(UserService);
  readonly #userDialogService = inject(UserDialogService);

  #reload = new BehaviorSubject(false);

  items: VmToolbarItem[] = [
    {
      key: 'addUser',
      icon: 'add',
      label: 'Neuer Benutzer',
      acton: async (): Promise<void> => {
        await this.#userDialogService.openCreateUserDialog();
        this.#reload.next(true);
      },
    },
  ];

  async execAction(rowData: User, key: string): Promise<void> {
    if (key === 'edit') {
      const reload = await this.#userDialogService.openEditUserDialog(rowData);
      if (reload) {
        this.#reload.next(true);
      }
      return;
    }

    if (key === 'delete') {
      const reload = await this.#userDialogService.openDeleteUserDialog(rowData);
      if (reload) {
        this.#reload.next(true);
      }
    }

    if (key === 'toggle') {
      const reload = await this.#userDialogService.openDisableToggleUserDialog(rowData);
      if (reload) {
        this.#reload.next(true);
      }
    }
  }

  data$: Observable<User[]> = this.#reload.pipe(
    switchMap((_x) => this.#userService.load$()),
  );

  columns: VmColumn<User>[] = [
    { key: 'userId', header: '', field: 'userId' }, //als Template und dann mit Icon isAdmin / isEnabled anzeigen?
    { key: 'name', header: 'Name', field: 'username' },
    { key: 'updatedAt', header: 'Geändert am', field: 'updatedAt', type: 'date' },
    { key: 'createdAt', header: 'Erstellt am', field: 'createdAt', type: 'date' },
    { key: 'updatedBy', header: 'Geändert von', field: 'updatedBy' },
    { key: 'createdBy', header: 'Erstellt von', field: 'createdBy' },
    { key: 'customActions', header: '', type: 'template' },
  ];
}
