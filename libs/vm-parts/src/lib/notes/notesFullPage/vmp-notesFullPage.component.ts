import {Component, computed, inject, input, InputSignal, output} from '@angular/core';
import {BehaviorSubject, map, Observable} from 'rxjs';
import {
  VmcDataGrid,
  VmcInputField,
  VmColumn,
  VmcToolbar,
  VmFormField,
  VmInputField,
  VmRowAction,
  VmRowClickedEvent,
  VmSelectOption,
  VmToolbarItem,
  VmValidFormTypes,
} from '@vm-components';
import { DownloadFileService } from './download-file.service';
import { VmpNotesFullpageDialogService } from './vmp-notes-fullPage-dialog.service';
import {VoiceService} from '@vm-utils/services';
import {toSignal} from '@angular/core/rxjs-interop';
import {AsyncPipe} from '@angular/common';

export interface AllNotesData {
  notesId: number;
  name: string;
  composer: string;
  folders: string;
  link: string;
  pageCount: number;
  voice: string;
}

@Component({
  selector: 'vmp-notes-full-page',
  imports: [VmcDataGrid, VmcInputField, VmcToolbar, AsyncPipe],
  templateUrl: './vmp-notesFullPage.component.html',
  styleUrl: './vmp-notesFullPage.component.scss',
  standalone: true,
})
export class VmpNotesFullPageComponent {
  data: InputSignal<AllNotesData[]> = input.required();
  zusatzAktion: InputSignal<VmRowAction[]> = input<VmRowAction[]>([]);
  buttonClicked = output<string>();
  itemAdded = output<boolean>();
  voiceFilterChanged = output<number>();

  readonly #printService = inject(VmpNotesFullpageDialogService);
  readonly #downloadFileService = inject(DownloadFileService);
  readonly #voiceService = inject(VoiceService);

  #voices = toSignal(this.#voiceService.load$({ includeInstrumentName: true}), { initialValue: [] });

  #selectedIds$ = new BehaviorSubject<number[]>([]);

  filter = computed<VmFormField>(() => {
    const voiceOptions = this.#voices()
      .map(v => ({ label: v.instrumentName + ' ' + v.name, value: v.voiceId.toString() } as VmSelectOption));

    return {
      key: 'voiceSelect',
      type: 'select',
      label: 'Filter',
      options: voiceOptions,
    };
  });

  async execAction(
    action: VmRowClickedEvent<AllNotesData>,
  ): Promise<void> {
    if (action.rowData === null) {
      return;
    }

    if(action.key === 'edit') {
      //todo: Dialog öffnen

      return;
    }

    this.buttonClicked.emit(action.key);
  }

  toolbarItems$: Observable<VmToolbarItem[]> = this.#selectedIds$.pipe(map(x => {
    const toolbarItems = [
      {
        key: 'addNotes',
        icon: 'add',
        label: 'Notenblatt hinzufügen',
        acton: async (): Promise<void> => {
          const result = await this.#printService.openAddNoteSheetDialog();
          if (result)
            this.itemAdded.emit(true);
        },
      }
    ]

    if (x.length > 0) {
      toolbarItems.push({
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
            const selectedIds = this.#selectedIds$.getValue();
            await this.#printService.openPrintDialog(selectedIds);
          },
        });
    }

    return toolbarItems;
  }))

  suchleiste: VmInputField = {
    key: 'searchbar',
    type: 'search',
    label: 'Suchen',
  };

  filterSelectionChange(event: VmValidFormTypes): void {
    this.voiceFilterChanged.emit(Number(event));
  }

  columns: VmColumn<AllNotesData>[] = [
    { key: 'name', header: 'Name', field: 'name', filterable: true },
    { key: 'voiceName', header: 'Stimme', field: 'voice' },
    { key: 'composer', header: 'Komponist', field: 'composer', filterable: true },
    { key: 'folders', header: 'Mappen', field: 'folders' },
    { key: 'pageCount', header: 'Seitenanzahl', field: 'pageCount' },
  ];

  public downloadFile(): void {
    const selectedIds = this.#selectedIds$.getValue();
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
    this.#selectedIds$.next(event);
  }
}
