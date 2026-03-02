import { Component, inject, input, InputSignal } from '@angular/core';
import { GroupDialogService } from '../../../../../../src/app/admin/goups/group-dialog.service';
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

  readonly #groupDataDialogService = inject(GroupDialogService);

  #reload = new BehaviorSubject(false);

  items: VmToolbarItem[] = [
    {
      key: 'addNotes',
      icon: 'add',
      label: 'Notenblätter hinzufügen',
      acton: async (): Promise<void> => {
        await this.#groupDataDialogService.openNewGroupDialog();
        this.#reload.next(true);
      },
    },
    {
      key: 'download',
      icon: 'file_download',
      label: 'Herunterladen',
      acton: async (): Promise<void> => {},
    },
    {
      key: 'drucken',
      icon: 'print',
      label: 'Drucken',
      acton: async (): Promise<void> => {},
    },
  ];

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
  protected readonly onselectionchange = onselectionchange;
}

