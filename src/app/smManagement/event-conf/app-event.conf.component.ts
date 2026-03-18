import { Component, inject, signal } from '@angular/core';
import {
  VmcDataGrid,
  VmcInputField,
  VmColumn,
  VmcToolbar,
  VmInputField,
  VmRowClickedEvent,
  VmToolbarItem,
} from '@vm-components';
import { Event, EventService } from '@vm-utils/services';
import {BehaviorSubject, firstValueFrom, switchMap} from 'rxjs';
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

  searchterm = signal<string | undefined>(undefined);


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
      if (!action.rowData) {
        return;
      }

      const eventWithScores = await firstValueFrom(
        this.eventService.loadByIdWithScores$(action.rowData.eventId),
      );
      const reload = await this.#eventDataDialogService.openEditEventDialog(eventWithScores);
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

  suchleiste: VmInputField = {
    key: 'searchbar',
    type: 'search',
    label: 'Suchen',
  };

  column: VmColumn<Event>[] = [
    { key: 'name', header: 'Name', field: 'name', filterable: true },
    { key: 'activUntil', header: 'Aktiv bis', field: 'activUntil', type: 'date', filterable: true },
    { key: 'updatedBy', header: 'Bearbeitet von', field: 'updatedBy', filterable: true },
    { key: 'updatedAt', header: 'Bearbeiten am', field: 'updatedAt', type: 'date-time', filterable: true },
  ];
}
