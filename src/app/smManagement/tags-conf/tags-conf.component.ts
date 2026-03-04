import { Component, inject, input, InputSignal } from '@angular/core';
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
import { GroupDialogService } from '../../admin/goups/group-dialog.service';
import { BehaviorSubject } from 'rxjs';
import { AllNotesData } from '../repository/app-repository.component';
import { Tag, TagsService } from '../../me/tags/Tag.service';
import { tags } from '@angular-devkit/core';

@Component({
  selector: 'app-tags-conf.component',
  imports: [VmcDataGrid, VmcInputField, VmcToolbar],
  templateUrl: './tags-conf.component.html',
  styleUrl: './tags-conf.component.scss',
})
export class TagsConfComponent {
  data: InputSignal<AllNotesData[]> = input.required();
  readonly #groupDataDialogService = inject(GroupDialogService);

  #reload = new BehaviorSubject(false);
  tagService = inject(TagsService);

  tagListe = this.tagService.tagListe;

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

  column: VmColumn<Tag>[] = [
    { key: 'name', header: 'Name', field: 'name' },
  ];
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  filterSelectionChange(event: VmValidFormTypes) {
    return console.log(event);
  }

  protected readonly tags = tags;
}
