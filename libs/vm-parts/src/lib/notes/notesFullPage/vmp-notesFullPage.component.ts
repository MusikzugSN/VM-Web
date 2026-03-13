import { Component, computed, inject, input, InputSignal, output, signal } from '@angular/core';
import { BehaviorSubject} from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  VmcDataGrid,
  VmcInputField,
  VmColumn,
  VmcToolbar,
  VmFormField,
  VmInputField,
  VmRowClickedEvent,
  VmToolbarItem,
  VmValidFormTypes,
} from '@vm-components';
import { DownloadFileService } from './download-file.service';
import { VmpNotesFullpageDialogService } from './vmp-notes-fullPage-dialog.service';
import { VoiceService } from '@vm-utils/services';

export interface AllNotesData {
  notesId: number;
  scoreId?: number;
  voiceId?: number;
  name: string;
  composer: string;
  folders: string;
  link: string;
  pageCount: number;
  voiceName: string;
}

@Component({
  selector: 'vmp-notes-full-page',
  imports: [VmcDataGrid, VmcInputField, VmcToolbar],
  templateUrl: './vmp-notesFullPage.component.html',
  styleUrl: './vmp-notesFullPage.component.scss',
  standalone: true,
})
export class VmpNotesFullPageComponent {
  data: InputSignal<AllNotesData[]> = input.required();
  showDeleteAction = input(false);
  showEditAction = input(false);
  itemAdded = output<boolean>();
  deleteClicked = output<AllNotesData>();
  editClicked = output<AllNotesData>();


  readonly #printService = inject(VmpNotesFullpageDialogService);
  readonly #downloadFileService = inject(DownloadFileService);
  readonly #voiceService = inject(VoiceService);

  #reload = new BehaviorSubject(false);
  #selectnext = new BehaviorSubject<number[]>([]);
  #selectedVoiceFilter = signal<string>('');
  voices = toSignal(this.#voiceService.load$(), { initialValue: [] });
  selectedNotesIds: number[] = [];

  toolbarItems: VmToolbarItem[] = [
    {
      key: 'addNotes',
      icon: 'add',
      label: 'Notenblatt hinzufügen',
      acton: async (): Promise<void> => {
        const result = await this.#printService.openAddNoteSheetDialog();
        if (result) {
          this.itemAdded.emit(true);
        }
        this.#reload.next(true);
      },
    },
    {
      key: 'download',
      icon: 'file_download',
      label: 'Herunterladen',
      acton: async (): Promise<void> => {
        this.downloadFile();
      },
    },
    {
      key: 'drucken',
      icon: 'print',
      label: 'Drucken',
      acton: async (): Promise<void> => {
        const selectedIds = this.selectedNotesIds.length > 0 ? this.selectedNotesIds : this.data().map(n => n.notesId);
        await this.#printService.openPrintDialog(selectedIds);
      },
    },
  ];

  filter = computed<VmFormField>(() => {
    const voiceOptions = this.voices()
      .map(v => [v.instrumentName, v.name].filter(Boolean).join(' ').trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b))
      .map(v => ({ label: v, value: v }));

    return {
      key: 'voiceSelect',
      type: 'select',
      label: 'Filter',
      options: voiceOptions,
    };
  });

  filteredData = computed<AllNotesData[]>(() => {
    const selectedVoice = this.#selectedVoiceFilter().trim();
    if (!selectedVoice) {
      return this.data();
    }

    return this.data().filter(x => x.voiceName === selectedVoice);
  });
  suchleiste: VmInputField = {
    key: 'searchbar',
    type: 'search',
    label: 'Suchen',
  };

  filterSelectionChange(event: VmValidFormTypes): void {
    this.#selectedVoiceFilter.set((event ?? '').toString());
  }

  columns: VmColumn<AllNotesData>[] = [
    { key: 'name', header: 'Name', field: 'name' },
    { key: 'composer', header: 'Komponist', field: 'composer' },
    { key: 'folders', header: 'Mappen', field: 'folders' },
    { key: 'pageCount', header: 'Seitenanzahl', field: 'pageCount' },
    { key: 'voiceName', header: 'Stimme', field: 'voiceName' },
  ];

  public downloadFile(): void {
    const selectedIds = this.selectedNotesIds.length > 0 ? this.selectedNotesIds : this.data().map(n => n.notesId).filter((id): id is number => id !== undefined);
    this.#downloadFileService.downloadFile(selectedIds).subscribe((response) => {
      const fileName = response.headers.get('content-disposition')?.split(';')[1]?.split('=')[1];

      if (fileName == undefined) {
        return;
      }

      const blob: Blob = response.body as Blob;
      const a = document.createElement('a');
      a.download = fileName;
      a.href = URL.createObjectURL(blob);
      a.click();
    });
  }

  selectionChanged(event: number[]): void {
    this.selectedNotesIds = event;
    this.#selectnext.next(event);
  }

  execGridAction(action: VmRowClickedEvent<AllNotesData>): void {
    if (action.key === 'edit' && action.rowData) {
      this.editClicked.emit(action.rowData);
      return;
    }

    if (action.key === 'delete' && action.rowData) {
      this.deleteClicked.emit(action.rowData);
    }
  }
}

