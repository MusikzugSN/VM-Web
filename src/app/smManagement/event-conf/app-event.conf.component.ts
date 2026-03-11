import { Component, inject } from '@angular/core';
import {
  VmcDataGrid,
  VmcInputField,
  VmColumn,
  VmcToolbar,
  VmFormField,
  VmRowClickedEvent,
  VmToolbarItem,
} from '@vm-components';
import { Event, EventService } from '@vm-utils/services';
import {BehaviorSubject, switchMap} from 'rxjs';
import { EventDialogService } from './event-conf-dialog.service';
import {AsyncPipe} from '@angular/common';


@Component({
  selector: 'app-event-conf',
  imports: [VmcDataGrid, VmcInputField, VmcToolbar, AsyncPipe],
  templateUrl: './app-event.conf.component.html',
  styleUrl: './app-event.conf.component.scss',
})
export class AppEventConfComponent {
  eventService = inject(EventService);
  #eventDataDialogService = inject(EventDialogService);

  #reload = new BehaviorSubject(false);
  eventListe$ = this.#reload.pipe(switchMap(_ => this.eventService.load$()));


  items: VmToolbarItem[] = [
    {
      key: 'addEvent',
      icon: 'add',
      label: 'Event hinzugefügen',
      acton: async (): Promise<void> => {
        await this.#eventDataDialogService.openNewEventDialog();
        this.#reload.next(true);
      },
    },
  ];
  async execAction(action: VmRowClickedEvent<Event>): Promise<void> {
    if (action.key === 'edit') {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const reload = await this.#eventDataDialogService.openEditEventDialog(action.rowData!);
      if (reload) {
        this.#reload.next(true);
      }
      return;
    }

    if (action.key === 'delete') {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const reload = await this.#eventDataDialogService.openDeleteEventDialog(action.rowData!);
      if (reload) {
        this.#reload.next(true);
      }
    }
  }

  suchleiste: VmFormField = {
    key: 'suchleiste',
    type: 'search',
    label: 'Suchleiste',
  };

  column: VmColumn<Event>[] = [
    { key: 'name', header: 'Name', field: 'name' },
    { key: 'activUntil', header: 'Aktiv bis', field: 'activUntil', type: 'date' },
    { key: 'updatedBy', header: 'Bearbeitet von', field: 'updatedBy' },
    { key: 'updatedAt', header: 'Bearbeiten am', field: 'updatedAt', type: 'date-time' },
  ];
}
