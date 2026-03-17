import { Component, inject } from '@angular/core';
import { User, UserService } from '@vm-utils/services';
import { UserDialogService } from './user-dialog.service';
import { VmColumn, VmToolbarItem, VmcDataGrid, VmcIconButton, VmcToolbar } from '@vm-components';
import { AsyncPipe } from '@angular/common';
import { BehaviorSubject, map, Observable, shareReplay, switchMap } from 'rxjs';
import { ConfigService } from '@vm-utils';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-users',
  imports: [VmcToolbar, VmcDataGrid, AsyncPipe, VmcIconButton],
  templateUrl: './app-users.component.html',
  styleUrl: './app-users.component.scss',
})
export class AppUsers {
  readonly #userService = inject(UserService);
  readonly #userDialogService = inject(UserDialogService);
  readonly #config = inject(ConfigService);

  #providers$ = this.#config.oauthProviders$.pipe(
    shareReplay({ refCount: true, bufferSize: 1 }),
    takeUntilDestroyed(),
  );

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

  data$: Observable<User[]> = this.#reload.pipe(switchMap((_x) => this.#userService.load$()));

  columns: VmColumn<User>[] = [
    { key: 'userId', header: '', field: 'userId' }, //als Template und dann mit Icon isAdmin / isEnabled anzeigen?
    { key: 'name', header: 'Name', field: 'username' },
    { key: 'oAuthProvider', header: 'OAuth-Provider', type: 'template' },
    { key: 'updatedBy', header: 'Geändert von', field: 'updatedBy' },
    { key: 'updatedAt', header: 'Geändert am', field: 'updatedAt', type: 'date-time' },
    { key: 'customActions', header: '', type: 'template' },
  ];

  computeProviderString(rowData: User): Observable<string> {
    return this.#providers$.pipe(
      map((providers) => providers.find((p) => p.providerKey === rowData.provider)),
      map((x) => {
        const providers: string[] = [];
        if (x !== undefined) {
          providers.push(x.displayName);
        }

        if (rowData.isEnabled) {
          providers.push('Lokaler Login');
        }

        return providers.join(', ');
      }),
    );
  }
}
