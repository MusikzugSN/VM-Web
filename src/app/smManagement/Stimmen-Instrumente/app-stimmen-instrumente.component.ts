import { Component, inject } from '@angular/core';
import {
  VmcDataGrid,
  VmcInputField,
  VmColumn,
  VmcToolbar,
  VmFormField,
  VmToolbarItem,
} from '@vm-components';
import { Voice, VoiceService } from './voice.service';
import { Instrument, InstrumentService } from './instrumente.service';
import { VoiceDialogService } from './voice-dialog.service';
import { InstrumentDialogService } from './instrument-dialog.service';


@Component({
  selector: 'app-stimmen-instrumente',
  imports: [VmcDataGrid, VmcToolbar, VmcInputField],
  templateUrl: './app-stimmen-instrumente.component.html',
  styleUrl: './app-stimmen-instrumente.component.scss',
})
export class AppStimmenInstrumenteComponent {
  voiceService = inject(VoiceService);
  instrumentService = inject(InstrumentService);
  readonly #voiceDialogService = inject(VoiceDialogService);
  readonly #instrumentDialogService = inject(InstrumentDialogService);

  voiceListe = this.voiceService.voiceListe;
  instrumentListe = this.instrumentService.instrumentListe;
  items: VmToolbarItem[] = [
    {
      key: 'addVoice',
      icon: 'add',
      label: 'Stimme hinzufügen',
      acton: async (): Promise<void> => {
        await this.#voiceDialogService.openAddVoiceDialog();
      },
    },
    {
      key: 'addInstrument',
      icon: 'add',
      label: 'Instrument hinzufügen',
      acton: async (): Promise<void> => {
        await this.#instrumentDialogService.openAddInstrumentDialog();
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
