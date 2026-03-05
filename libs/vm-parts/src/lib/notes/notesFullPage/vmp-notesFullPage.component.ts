import { Component, inject, input, InputSignal } from '@angular/core';
import { RepositoryDialogService } from '../../../../../../src/app/smManagement/repository/repository-dialog.service';
import { BehaviorSubject} from 'rxjs';
import {
  VmcDataGrid,
  VmcInputField,
  VmColumn,
  VmcToolbar,
  VmFormField,
  VmInputField,
  VmToolbarItem,
  VmValidFormTypes,
} from '@vm-components';
import { DownloadFileService } from './download-file.service';
import { VoiceService } from '../../../../../../src/app/smManagement/Stimmen-Instrumente/voice.service';

interface AllNotesData {
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
  showDownloadPrint: InputSignal<boolean> = input<boolean>(true);
  showFilter: InputSignal<boolean> = input<boolean>(true);
  simpleAddDialog: InputSignal<boolean> = input<boolean>(false);
  customToolbarItems: InputSignal<VmToolbarItem[] | undefined> = input<VmToolbarItem[] | undefined>(undefined);

  readonly #repositoryDialogService = inject(RepositoryDialogService);
  readonly #downloadFileService = inject(DownloadFileService);
  readonly #VoiceService = inject(VoiceService);

  folderListe = this.#VoiceService.voiceListe;
  #reload = new BehaviorSubject(false);

  get defaultItems(): VmToolbarItem[] {
    const addLabel = this.simpleAddDialog() ? 'Notenstück hinzufügen' : 'Notenblatt hinzufügen';
    return [
      {
        key: 'addNotes',
        icon: 'add',
        label: addLabel,
        acton: async (): Promise<void> => {
          if (this.simpleAddDialog()) {
            await this.#repositoryDialogService.openAddScoreDialogSimple();
          } else {
            await this.#repositoryDialogService.openAddScoreDialog();
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
        acton: async (): Promise<void> => {},
      },
    ];
  }

  get items(): VmToolbarItem[] {
    const custom = this.customToolbarItems();
    if (custom) {
      return custom;
    }
    if (!this.showDownloadPrint()) {
      return this.defaultItems.filter((i) => i.key === 'addNotes');
    }
    return this.defaultItems;
  }

  filter: VmFormField = {
    key: 'voiceSelect',
    type: 'select',
    label: 'Filter',
    options: [
      { value: 'stimme 1', label: 'Stimme 1' },
      { value: 'stimme 2', label: 'Stimme 2' },
      { value: 'stimme 3', label: 'Stimme 3' },
    ],
  };
  suchleiste: VmInputField = {
    key: 'searchbar',
    type: 'search',
    label: 'Suchen',
  };

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  filterSelectionChange(event: VmValidFormTypes) {
    return console.log(event);
  }

  columns: VmColumn<AllNotesData>[] = [
    { key: 'name', header: 'Name', field: 'name' },
    { key: 'composer', header: 'Komponist', field: 'composer' },
    { key: 'folders', header: 'Mappen', field: 'folders' },
    { key: 'pageCount', header: 'Seitenanzahl', field: 'pageCount' },
    { key: 'voiceName', header: 'Stimme', field: 'voiceName' },
  ];

  public downloadFile(): void {
    this.#downloadFileService.downloadFile().subscribe((response) => {
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
  protected readonly onselectionchange = onselectionchange;
}

