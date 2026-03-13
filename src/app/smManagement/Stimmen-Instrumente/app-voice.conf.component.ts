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
import { Voice, VoiceService } from '@vm-utils/services';
import { BehaviorSubject, switchMap } from 'rxjs';
import { VoiceConfDialogService } from './voice-conf-dialog.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-voice-conf',
  imports: [VmcDataGrid, VmcInputField, VmcToolbar, AsyncPipe],
  templateUrl: './app-voice.conf.component.html',
  styleUrl: './app-voice.conf.component.scss',
})
export class AppVoiceConfComponent {
  voiceService = inject(VoiceService);
  #voiceDialogService = inject(VoiceConfDialogService);

  #reload = new BehaviorSubject(false);
  voiceListe$ = this.#reload.pipe(switchMap(_ => this.voiceService.load$()));

  items: VmToolbarItem[] = [
    {
      key: 'addVoice',
      icon: 'add',
      label: 'Stimme hinzufügen',
      acton: async (): Promise<void> => {
        await this.#voiceDialogService.openNewVoiceDialog();
        this.#reload.next(true);
      },
    },
  ];

  async execAction(action: VmRowClickedEvent<Voice>): Promise<void> {
    if (action.key === 'edit' && action.rowData) {
      const reload = await this.#voiceDialogService.openEditVoiceDialog(action.rowData);
      if (reload) {
        this.#reload.next(true);
      }
      return;
    }
    if (action.key === 'delete' && action.rowData) {
      const reload = await this.#voiceDialogService.openDeleteVoiceDialog(action.rowData);
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

  column: VmColumn<Voice>[] = [
    { key: 'name', header: 'Name', field: 'name' },
    { key: 'instrumentName', header: 'Instrument', field: 'instrumentName' },
    { key: 'countOfMusicsheets', header: 'Anzahl Notenblätter', field: 'countOfMusicsheets' },
    { key: 'updatedBy', header: 'Bearbeitet von', field: 'updatedBy' },
    { key: 'updatedAt', header: 'Bearbeiten am', field: 'updatedAt', type: 'date-time' },
  ];
}
