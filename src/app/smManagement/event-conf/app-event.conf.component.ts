import { Component, computed, inject, signal } from '@angular/core';
import {
  VmcDataGrid,
  VmcInputField,
  VmColumn,
  VmRowAction,
  VmcToolbar,
  VmInputField,
  VmRowClickedEvent,
  VmToolbarItem,
} from '@vm-components';
import { Event, EventService, PermissionService, PermissionType } from '@vm-utils/services';
import {BehaviorSubject, firstValueFrom, switchMap} from 'rxjs';
import { EventDialogService } from './event-conf-dialog.service';
import {AsyncPipe} from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';


@Component({
  selector: 'app-event-conf',
  imports: [VmcDataGrid, VmcInputField, VmcToolbar, AsyncPipe],
  templateUrl: './app-event.conf.component.html',
  styleUrl: './app-event.conf.component.scss',
})
export class AppEventConfComponent {
  eventService = inject(EventService);
  #eventDataDialogService = inject(EventDialogService);
  readonly #permissionService = inject(PermissionService);

  #reload = new BehaviorSubject(false);
  eventListe$ = this.#reload.pipe(switchMap(_ => this.eventService.load$()));

  searchterm = signal<string | undefined>(undefined);

  canCreateEvent = toSignal(this.#permissionService.hasPermission$(PermissionType.CreateEvent), {
    initialValue: false,
  });
  canUpdateEvent = toSignal(this.#permissionService.hasPermission$(PermissionType.UpdateEvent), {
    initialValue: false,
  });
  canDeleteEvent = toSignal(this.#permissionService.hasPermission$(PermissionType.DeleteEvent), {
    initialValue: false,
  });

  rowActions = computed<VmRowAction[]>(() => {
    const actions: VmRowAction[] = [];

    if (this.canUpdateEvent()) {
      actions.push({ key: 'edit', icon: 'edit' });
    }

    if (this.canDeleteEvent()) {
      actions.push({ key: 'delete', icon: 'delete' });
    }

    return actions;
  });

  items = computed<VmToolbarItem[]>(() => {
    if (!this.canCreateEvent()) {
      return [];
    }

    return [
      {
        key: 'addEvent',
        icon: 'add',
        label: 'Event hinzugefügen',
        action: async (): Promise<void> => {
          await this.#eventDataDialogService.openNewEventDialog();
          this.#reload.next(true);
        },
      },
    ];
  });
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
    { key: 'date', header: 'Aktiv bis', field: 'date', type: 'date', filterable: true },
    { key: 'updatedBy', header: 'Bearbeitet von', field: 'updatedBy', filterable: true },
    { key: 'updatedAt', header: 'Bearbeiten am', field: 'updatedAt', type: 'date-time', filterable: true },
  ];
}
