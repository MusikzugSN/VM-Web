import { Component, computed, inject, input, InputSignal, signal } from '@angular/core';
import {
  VmcDataGrid,
  VmcInputField,
  VmColumn,
  VmRowAction,
  VmcToolbar,
  VmFormField,
  VmInputField,
  VmRowClickedEvent,
  VmToolbarItem,
} from '@vm-components';
import { BehaviorSubject, switchMap } from 'rxjs';
import { TagDialogService } from './tags-conf-dialog.service';
import { AllNotesData } from '@vm-parts';
import { PermissionService, PermissionType, Tag, TagsService } from '@vm-utils/services';
import { AsyncPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-tags-conf.component',
  imports: [VmcDataGrid, VmcInputField, VmcToolbar, AsyncPipe],
  templateUrl: './tags-conf.component.html',
  styleUrl: './tags-conf.component.scss',
})
export class TagsConfComponent {
  data: InputSignal<AllNotesData[]> = input.required();
  readonly #tagDataDialogService = inject(TagDialogService);
  readonly #permissionService = inject(PermissionService);

  #reload = new BehaviorSubject(false);
  tagService = inject(TagsService);
  tagListe$ = this.#reload.pipe(switchMap((_) => this.tagService.load$()));

  canCreateTags = toSignal(this.#permissionService.hasPermission$(PermissionType.CreateTags), {
    initialValue: false,
  });
  canUpdateTags = toSignal(this.#permissionService.hasPermission$(PermissionType.UpdateTags), {
    initialValue: false,
  });
  canDeleteTags = toSignal(this.#permissionService.hasPermission$(PermissionType.DeleteTags), {
    initialValue: false,
  });

  rowActions = computed<VmRowAction[]>(() => {
    const actions: VmRowAction[] = [];

    if (this.canUpdateTags()) {
      actions.push({ key: 'edit', icon: 'edit' });
    }

    if (this.canDeleteTags()) {
      actions.push({ key: 'delete', icon: 'delete' });
    }

    return actions;
  });

  items = computed<VmToolbarItem[]>(() => {
    if (!this.canCreateTags()) {
      return [];
    }

    return [
      {
        key: 'addNotes',
        icon: 'add',
        label: 'Tag hinzufügen',
        action: async (): Promise<void> => {
          await this.#tagDataDialogService.openNewTagDialog();
          this.#reload.next(true);
        },
      },
    ];
  });

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
      type: 'date-time',
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
}
