import { inject, Injectable } from '@angular/core';
import { VmDialogService } from '@vm-utils/dialogs';
import { AppVoiceDataDialog } from './dataDialog/app-voice-data-dialog.component';
import { Voice } from '@vm-utils/services';
import { VoiceDeleteDialog } from './deleteDialog/voice-delete-dialog-component';

@Injectable({
  providedIn: 'root',
})
export class VoiceConfDialogService {
  readonly #dialogService = inject(VmDialogService);

  async openDeleteVoiceDialog(data: Voice): Promise<boolean | undefined> {
    return this.#dialogService.open(VoiceDeleteDialog, {
      data: data,
      title: 'Stimme löschen',
      buttons: [
        { key: 'close', text: 'Abbrechen', type: 'elevated' },
        { key: 'delete', text: 'Löschen', type: 'filled', color: 'error' },
      ],
    });
  }

  async openEditVoiceDialog(data: Voice): Promise<boolean | undefined> {
    return this.#dialogService.open(AppVoiceDataDialog, {
      data: data,
      title: 'Stimme bearbeiten',
      buttons: [
        { key: 'close', text: 'Abbrechen', type: 'elevated' },
        { key: 'save', text: 'Speichern', type: 'filled' },
      ],
    });
  }

  async openNewVoiceDialog(): Promise<boolean | undefined> {
    return this.#dialogService.open(AppVoiceDataDialog, {
      data: undefined,
      title: 'Stimme erstellen',
      buttons: [
        { key: 'close', text: 'Abbrechen', type: 'elevated' },
        { key: 'create', text: 'Erstellen', type: 'filled' },
      ],
    });
  }
}
