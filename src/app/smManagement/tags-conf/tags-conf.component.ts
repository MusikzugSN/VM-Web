import { Component, inject, input, InputSignal } from '@angular/core';
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
import { Tag, TagsService } from '../../me/tags/Tag.service';
import { tags } from '@angular-devkit/core';
import { TagDialogService } from './tags-conf-dialog.service';
import {AllNotesData} from '@vm-parts';

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

  column: VmColumn<Tag>[] = [
    { key: 'name', header: 'Name', field: 'name' },
    { key: 'updatedAt', header: 'Bearbeiten am', field: 'updatedAt', type: 'date' },
    { key: 'updatedBy', header: 'Bearbeitet von', field: 'updatedBy', type: 'date' },
  ];
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  filterSelectionChange(event: VmValidFormTypes) {
    return console.log(event);
  }

  protected readonly tags = tags;
}
