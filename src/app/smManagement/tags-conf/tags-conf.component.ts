import { Component, inject, input, InputSignal, signal } from '@angular/core';
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
import { BehaviorSubject } from 'rxjs';
import { TagDialogService } from './tags-conf-dialog.service';
import { AllNotesData } from '@vm-parts';
import { Tag, TagsService } from '@vm-utils/services';

@Component({
  selector: 'app-tags-conf.component',
  imports: [VmcDataGrid, VmcInputField, VmcToolbar],
  templateUrl: './tags-conf.component.html',
  styleUrl: './tags-conf.component.scss',
})
export class TagsConfComponent {
  data: InputSignal<AllNotesData[]> = input.required();
  readonly #tagDataDialogService = inject(TagDialogService);

  #reload = new BehaviorSubject(false);
  tagService = inject(TagsService);

  tagListe = this.tagService.tagListe;

  items: VmToolbarItem[] = [
    {
      key: 'addNotes',
      icon: 'add',
      label: 'Tag hinzufügen',
      acton: async (): Promise<void> => {
        await this.#tagDataDialogService.openNewTagDialog();
        this.#reload.next(true);
      },
    },
  ];

  async execAction(action: VmRowClickedEvent<Tag>): Promise<void> {
    if (action.key === 'edit') {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const reload = await this.#tagDataDialogService.openEditTagDialog(action.rowData!);
      if (reload) {
        this.#reload.next(true);
      }
      return;
    }

    if (action.key === 'delete') {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const reload = await this.#tagDataDialogService.openDeleteTagDialog(action.rowData!);
      if (reload) {
        this.#reload.next(true);
      }
    }
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

  searchterm = signal<string | undefined>(undefined);

  column: VmColumn<Tag>[] = [
    { key: 'name', header: 'Name', field: 'name', filterable: true },
    {
      key: 'updatedAt',
      header: 'Bearbeiten am',
      field: 'updatedAt',
      type: 'date',
      filterable: true,
    },
    {
      key: 'updatedBy',
      header: 'Bearbeitet von',
      field: 'updatedBy',
      type: 'date',
      filterable: true,
    },
  ];

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  filterSelectionChange(event: VmValidFormTypes) {
    return console.log(event);
  }
}
