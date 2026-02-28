import { inject, Injectable } from '@angular/core';
import { VmDialogService } from '@vm-utils';
import { Role } from './role.service';
import { AppDeleteRoleDialog } from './deleteDialog/app-delete-role-dialog.component';
import { AppRoleDataDialog } from './dataDialog/app-role-data-dialog.component';
@Injectable({
  providedIn: 'root',
})
export class RoleDialogService {
  readonly #dialogService = inject(VmDialogService);

  async openCreateRoleDialog(): Promise<boolean | undefined> {
    return this.#dialogService.open(AppRoleDataDialog, {
      title: 'Rolle erstellen',
      buttons: [
        { key: 'close', text: 'Abbrechen', type: 'elevated' },
        { key: 'create', text: 'Erstellen', type: 'filled' },
      ],
      dialogConfig: {
        minWidth: 1200,
      },
    });
  }

  async openEditRoleDialog(data: Role): Promise<boolean | undefined> {
    return this.#dialogService.open(AppRoleDataDialog, {
      data: data,
      title: 'Rolle bearbeiten',
      buttons: [
        { key: 'close', text: 'Abbrechen', type: 'elevated' },
        { key: 'save', text: 'Speichern', type: 'filled' },
      ],
      dialogConfig: {
        minWidth: 1200,
      },
    });
  }

  async openDeleteRoleDialog(data: Role): Promise<boolean | undefined> {
    return this.#dialogService.open(AppDeleteRoleDialog, {
      data: data,
      title: 'Rolle löschen',
      buttons: [
        { key: 'close', text: 'Abbrechen', type: 'elevated' },
        { key: 'delete', text: 'Löschen', type: 'filled', color: 'error' },
      ],
    });
  }
}
