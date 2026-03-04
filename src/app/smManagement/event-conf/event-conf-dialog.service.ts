import { inject, Injectable } from '@angular/core';
import { VmDialogService } from '@vm-utils';
import { AppEventDataDialog } from './dataDialog/app-event-data-dialog.component';
import { Event } from '../../me/event/event.service';
import { EventDeleteDialog } from './deleteDialog/event-delete-dialog.component';


@Injectable({
  providedIn: 'root',
})

export class EventDialogService {
  readonly #dialogService = inject(VmDialogService);

  async openDeleteEventDialog(data: Event): Promise<boolean | undefined> {
    return this.#dialogService.open(EventDeleteDialog, {
      data: data,
      title: 'Event löschen',
      buttons: [
        { key: 'close', text: 'Abbrechen', type: 'elevated' },
        { key: 'delete', text: 'Löschen', type: 'filled', color: 'error' },
      ],
    });
  }

  async openEditEventDialog(data: Event): Promise<boolean | undefined> {
    return this.#dialogService.open(AppEventDataDialog, {
      data: data,
      title: 'Event bearbeiten',
      buttons: [
        { key: 'close', text: 'Abbrechen', type: 'elevated' },
        { key: 'save', text: 'Speichern', type: 'filled'},
      ]
    });
  }
  async openNewEventDialog(): Promise<boolean | undefined> {
    return this.#dialogService.open(AppEventDataDialog, {
      data: undefined,
      title: 'Event erstellen',
      buttons: [
        { key: 'close', text: 'Abbrechen', type: 'elevated' },
        { key: 'create', text: 'Erstellen', type: 'filled'}
      ]
    })
  }


}
