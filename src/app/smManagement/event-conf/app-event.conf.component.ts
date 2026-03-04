import { Component, inject } from '@angular/core';
import {
  VmcDataGrid,
  VmcInputField,
  VmColumn,
  VmcToolbar,
  VmFormField,
  VmToolbarItem,
} from '@vm-components';
import { Event, EventService } from '../../me/event/event.service';

@Component({
  selector: 'app-event.conf.component',
  imports: [VmcDataGrid, VmcInputField, VmcToolbar],
  templateUrl: './app-event.conf.component.html',
  styleUrl: './app-event.conf.component.scss',
})
export class AppEventConfComponent {
  eventService = inject(EventService);

  eventListe = this.eventService.eventListe;

  items: VmToolbarItem[] = [
    {
      key: 'addEvent',
      icon: 'add',
      label: 'Event hinzugefügen',
      acton: async () => {},
    },
  ];

  suchleiste: VmFormField = {
    key: 'suchleiste',
    type: 'search',
    label: 'Suchleiste',
  };

  column: VmColumn<Event>[] = [
    { key: 'name', header: 'Name', field: 'name' },
    { key: 'updatedAt', header: 'Bearbeiten am', field: 'updatedAt', type: 'date' },
    { key: 'updatedBy', header: 'Bearbeitet von', field: 'updatedBy', type: 'date' },
    { key: 'activUntil', header: 'Aktiv bis' , field: 'activUntil' },
  ];
}
