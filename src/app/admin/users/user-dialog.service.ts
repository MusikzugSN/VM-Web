import { inject, Injectable } from '@angular/core';
import { VmDialogService } from '@vm-utils/dialogs';
import { AppUserDataDialog } from './dataDialog/app-user-data-dialog.component';
import { AppUserDeleteDialog } from './deleteDialog/app-user-delete-dialog.component';
import { User } from '@vm-utils/services';
@Injectable({
  providedIn: 'root',
})
export class UserDialogService {
  readonly #dialogService = inject(VmDialogService);

  async openCreateUserDialog(): Promise<boolean | undefined> {
    return this.#dialogService.open(AppUserDataDialog, {
      title: 'Benutzer erstellen',
      buttons: [
        { key: 'close', text: 'Abbrechen', type: 'elevated' },
        { key: 'create', text: 'Erstellen', type: 'filled' },
      ],
      dialogConfig: {
        minWidth: '900px',
      },
    });
  }

  async openEditUserDialog(data: User): Promise<boolean | undefined> {
    return this.#dialogService.open(AppUserDataDialog, {
      data: data,
      title: 'Benutzer bearbeiten',
      buttons: [
        { key: 'close', text: 'Abbrechen', type: 'elevated' },
        { key: 'save', text: 'Speichern', type: 'filled' },
      ],
      dialogConfig: {
        minWidth: '900px',
      },
    });
  }

  async openDeleteUserDialog(data: User): Promise<boolean | undefined> {
    return this.#dialogService.open(AppUserDeleteDialog, {
      data: { ...data, asDisable: false },
      title: 'Benutzer löschen',
      buttons: [
        { key: 'close', text: 'Abbrechen', type: 'elevated' },
        { key: 'delete', text: 'Löschen', type: 'filled', color: 'error' },
      ],
    });
  }

  async openDisableToggleUserDialog(data: User): Promise<boolean | undefined> {
    const actionToolbar = data.isEnabled ? 'deaktivieren' : 'reaktivieren';
    const actionButton = data.isEnabled ? 'Deaktivieren' : 'Reaktivieren';
    const actionButtonType = data.isEnabled ? 'disable' : 'enable';
    return this.#dialogService.open(AppUserDeleteDialog, {
      data: { ...data, asDisable: true },
      title: `Benutzer ${actionToolbar}`,
      buttons: [
        { key: 'close', text: 'Abbrechen', type: 'elevated' },
        {
          key: actionButtonType,
          text: actionButton,
          type: 'filled',
          color: data.isEnabled ? 'error' : 'primary',
        },
      ],
    });
  }
}
