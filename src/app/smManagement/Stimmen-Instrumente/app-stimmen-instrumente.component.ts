import { Component, computed, inject, signal } from '@angular/core';
import {
  VmcDataGrid,
  VmcInputField,
  VmColumn,
  VmRowAction,
  VmcToolbar,
  VmFormField,
  VmToolbarItem,
  VmRowClickedEvent,
  VmValidFormTypes,
} from '@vm-components';
import {
  Instrument,
  InstrumentService,
  PermissionService,
  PermissionType,
  Voice,
  VoiceService,
} from '@vm-utils/services';
import { VoiceDialogService } from './voice-dialog.service';
import { InstrumentDialogService } from './instrument-dialog.service';
import { BehaviorSubject, map, switchMap } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { NumDictionary } from '@vm-utils';
import { toSignal } from '@angular/core/rxjs-interop';

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
  readonly #permissionService = inject(PermissionService);

  #reload = new BehaviorSubject(false);
  voiceListe$ = this.#reload.pipe(
    switchMap((_) =>
      this.voiceService
        .load$({ includeInstrumentName: true })
        .pipe(
          map((x) =>
            x.sort((a, b) => this.#computeVoiceName(a).localeCompare(this.#computeVoiceName(b))),
          ),
        ),
    ),
  );
  instrumentListe$ = this.#reload.pipe(switchMap((_) => this.instrumentService.load$()));

  searchTerm = signal<string | undefined>(undefined);

  canCreateVoice = toSignal(this.#permissionService.hasPermission$(PermissionType.CreateVoice), {
    initialValue: false,
  });
  canUpdateVoice = toSignal(this.#permissionService.hasPermission$(PermissionType.UpdateVoice), {
    initialValue: false,
  });
  canDeleteVoice = toSignal(this.#permissionService.hasPermission$(PermissionType.DeleteVoice), {
    initialValue: false,
  });

  rowActions = computed<VmRowAction[]>(() => {
    const actions: VmRowAction[] = [];

    if (this.canUpdateVoice()) {
      actions.push({ key: 'edit', icon: 'edit' });
    }

    if (this.canDeleteVoice()) {
      actions.push({ key: 'delete', icon: 'delete' });
    }

    return actions;
  });

  items = computed<VmToolbarItem[]>(() => {
    if (!this.canCreateVoice()) {
      return [];
    }

    return [
      {
        key: 'addVoice',
        icon: 'add',
        label: 'Stimme hinzufügen',
        action: async (): Promise<void> => {
          await this.#voiceDialogService.openAddVoiceDialog();
          this.#reload.next(true);
        },
      },
      {
        key: 'addInstrument',
        icon: 'add',
        label: 'Instrument hinzufügen',
        action: async (): Promise<void> => {
          await this.#instrumentDialogService.openAddInstrumentDialog();
          this.#reload.next(true);
        },
      },
    ];
  });

  async execActionVoice(action: VmRowClickedEvent<Voice>): Promise<void> {
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

  async execActionInstrument(action: VmRowClickedEvent<Instrument>): Promise<void> {
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

  columnsVoice: VmColumn<Voice>[] = [
    {
      key: 'name',
      header: 'Name',
      type: 'converter',
      field: 'voiceId',
      filterable: true,
      converter: (rowData) => this.#computeVoiceName(rowData),
    },
    { key: 'updatedAt', header: 'Bearbeiten am', field: 'updatedAt', type: 'date-time' },
    { key: 'updatedBy', header: 'Bearbeitet von', field: 'updatedBy' },
  ];
  columnsInstrument: VmColumn<Instrument>[] = [
    { key: 'name', header: 'Name', field: 'name', filterable: true },
    { key: 'type', header: 'Instrumentenart', field: 'type' },
    { key: 'updatedAt', header: 'Bearbeiten am', field: 'updatedAt', type: 'date-time' },
    { key: 'updatedBy', header: 'Bearbeitet von', field: 'updatedBy' },
  ];

  #computedVoiceNames: NumDictionary<string> = {};
  #computeVoiceName(voice: Voice): string {
    if (this.#computedVoiceNames[voice.voiceId] === undefined) {
      this.#computedVoiceNames[voice.voiceId] = voice.instrumentName + ' ' + voice.name;
    }

    return this.#computedVoiceNames[voice.voiceId] ?? '';
  }

  searchChanged(term: VmValidFormTypes): void {
    this.searchTerm.set(term.toString());
  }
}
