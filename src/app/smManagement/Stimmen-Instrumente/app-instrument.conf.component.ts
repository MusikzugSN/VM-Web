import { Component, inject } from '@angular/core';
import {
  VmcDataGrid,
  VmcInputField,
  VmcToolbar,
  VmFormField,
  VmRowClickedEvent,
  VmToolbarItem,
  VmColumn,
} from '@vm-components';
import { Instrument, InstrumentService } from '@vm-utils/services';
import { BehaviorSubject, switchMap } from 'rxjs';
import { InstrumentConfDialogService } from './instrument-conf-dialog.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-instrument-conf',
  imports: [VmcDataGrid, VmcInputField, VmcToolbar, AsyncPipe],
  templateUrl: './app-instrument.conf.component.html',
  styleUrl: './app-instrument.conf.component.scss',
})
export class AppInstrumentConfComponent {
  instrumentService = inject(InstrumentService);
  #instrumentDialogService = inject(InstrumentConfDialogService);

  #reload = new BehaviorSubject(false);
  instrumentListe$ = this.#reload.pipe(switchMap(_ => this.instrumentService.load$()));

  items: VmToolbarItem[] = [
    {
      key: 'addInstrument',
      icon: 'add',
      label: 'Instrument hinzufügen',
      acton: async (): Promise<void> => {
        await this.#instrumentDialogService.openNewInstrumentDialog();
        this.#reload.next(true);
      },
    },
  ];

  async execAction(action: VmRowClickedEvent<Instrument>): Promise<void> {
    if (action.key === 'edit' && action.rowData) {
      const reload = await this.#instrumentDialogService.openEditInstrumentDialog(action.rowData);
      if (reload) {
        this.#reload.next(true);
      }
      return;
    }
    if (action.key === 'delete' && action.rowData) {
      const reload = await this.#instrumentDialogService.openDeleteInstrumentDialog(action.rowData);
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

  column: VmColumn<Instrument>[] = [
    { key: 'name', header: 'Name', field: 'name' },
    { key: 'type', header: 'Instrumentenart', field: 'type' },
    { key: 'updatedBy', header: 'Bearbeitet von', field: 'updatedBy' },
    { key: 'updatedAt', header: 'Bearbeiten am', field: 'updatedAt', type: 'date-time' },
  ];
}
