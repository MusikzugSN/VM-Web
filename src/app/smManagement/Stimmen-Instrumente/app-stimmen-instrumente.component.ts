import { Component, inject } from '@angular/core';
import {
  VmcDataGrid,
  VmcInputField,
  VmColumn,
  VmcToolbar,
  VmFormField,
  VmToolbarItem,
} from '@vm-components';
import { Voice, VoiceService, Instrument, InstrumentService } from '@vm-utils/services';
import { VoiceDialogService } from './voice-dialog.service';
import { InstrumentDialogService } from './instrument-dialog.service';
import { BehaviorSubject, switchMap } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-stimmen-instrumente',
  imports: [VmcDataGrid, VmcToolbar, VmcInputField, AsyncPipe],
  templateUrl: './app-stimmen-instrumente.component.html',
  styleUrl: './app-stimmen-instrumente.component.scss',
})
export class AppStimmenInstrumenteComponent {
  voiceService = inject(VoiceService);
  instrumentService = inject(InstrumentService);
  readonly #voiceDialogService = inject(VoiceDialogService);
  readonly #instrumentDialogService = inject(InstrumentDialogService);

  #reload = new BehaviorSubject(false);
  voiceListe$ = this.#reload.pipe(switchMap(_ => this.voiceService.load$()));
  instrumentListe$ = this.#reload.pipe(switchMap(_ => this.instrumentService.load$()));

  items: VmToolbarItem[] = [
    {
      key: 'addVoice',
      icon: 'add',
      label: 'Stimme hinzufügen',
      acton: async (): Promise<void> => {
        await this.#voiceDialogService.openAddVoiceDialog();
        this.#reload.next(true);
      },
    },
    {
      key: 'addInstrument',
      icon: 'add',
      label: 'Instrument hinzufügen',
      acton: async (): Promise<void> => {
        await this.#instrumentDialogService.openAddInstrumentDialog();
        this.#reload.next(true);
      },
    },
  ];

  suchleiste: VmFormField = {
    key: 'suchleiste',
    type: 'search',
    label: 'Suchleiste',
  };
  columnsVoice: VmColumn<Voice>[] = [
    {
      key: 'name',
      header: 'Name',
      type: 'converter',
      converter: (rowData) => rowData.instrumentName + ' ' + rowData.name,
    },
    { key: 'updatedAt', header: 'Bearbeiten am', field: 'updatedAt', type: 'date' },
    { key: 'updatedBy', header: 'Bearbeitet von', field: 'updatedBy' },
  ];
  columnsInstrument: VmColumn<Instrument>[] = [
    { key: 'name', header: 'Name', field: 'name' },
    { key: 'type', header: 'Instrumentenart', field: 'type' },
    { key: 'updatedAt', header: 'Bearbeiten am', field: 'updatedAt', type: 'date' },
    { key: 'updatedBy', header: 'Bearbeitet von', field: 'updatedBy' },
  ];
}
