import { Component, computed, inject } from '@angular/core';
import {
  VmcDataGrid,
  VmcInputField,
  VmColumn,
  VmRowAction,
  VmcToolbar,
  VmFormField,
  VmRowClickedEvent,
  VmToolbarItem,
} from '@vm-components';
import {
  Folder,
  FoldersService,
  Group,
  GroupService,
  PermissionService,
  PermissionType,
} from '@vm-utils/services';
import { BehaviorSubject, firstValueFrom, map, Observable, switchMap } from 'rxjs';
import { FolderDialogService } from './folder-conf-dialog.service';
import { AsyncPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { AsPipe, NumDictionary } from '@vm-utils';

@Component({
  selector: 'app-folders-conf',
  imports: [VmcDataGrid, VmcToolbar, VmcInputField, AsyncPipe, AsPipe],
  templateUrl: './app-folders-conf.component.html',
  styleUrl: './app-folders-conf.component.scss',
})
export class AppFoldersConfComponent {
  readonly #folderService = inject(FoldersService);
  readonly #folderDataDialogService = inject(FolderDialogService);
  readonly #groupService = inject(GroupService);
  readonly #permissionService = inject(PermissionService);

  #reload = new BehaviorSubject(false);

  canCreateMusicFolder = toSignal(
    this.#permissionService.hasPermission$(PermissionType.CreateMusicFolder),
    { initialValue: false },
  );

  canUpdateMusicFolder = toSignal(
    this.#permissionService.hasPermission$(PermissionType.UpdateMusicFolder),
    { initialValue: false },
  );

  canDeleteMusicFolder = toSignal(
    this.#permissionService.hasPermission$(PermissionType.DeleteMusicFolder),
    { initialValue: false },
  );

  // für jede Mappe membercount aus scores nehmen
  folderListe$ = this.#reload.pipe(
    switchMap(() => this.#folderService.loadWithSheets$()),
    map((folders) =>
      folders.map((folder) => ({
        ...folder,
        // wenn scores fehlt, leeres Array
        membercount: (folder.scores ?? []).filter((s) => !s.deleted).length,
      })),
    ),
  );

  #filterTerm$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  filterTerm = toSignal<string, string>(this.#filterTerm$, {
    initialValue: '',
  });

  #groups$ = this.#groupService.load$();

  #groupsById$: Observable<NumDictionary<Group>> = this.#groups$.pipe(
    map((x) =>
      x.reduce((acc, score) => ({ ...acc, [score.groupId]: score }), {} as NumDictionary<Group>),
    ),
  );

  groupsById = toSignal<NumDictionary<Group>, NumDictionary<Group>>(this.#groupsById$, {
    initialValue: {},
  });

  // @ts-ignore
  FolderType: Folder;

  rowActions = computed<VmRowAction[]>(() => {
    const actions: VmRowAction[] = [];

    if (this.canUpdateMusicFolder()) {
      actions.push({ key: 'edit', icon: 'edit' });
    }

    if (this.canDeleteMusicFolder()) {
      actions.push({ key: 'delete', icon: 'delete' });
    }

    return actions;
  });

  items = computed<VmToolbarItem[]>(() => {
    if (!this.canCreateMusicFolder()) {
      return [];
    }
    return [
      {
        key: 'addFolder',
        icon: 'add',
        label: 'Mappe hinzufügen',
        action: async (): Promise<void> => {
          await this.#folderDataDialogService.openNewFolderDialog();
          this.#reload.next(true);
        },
      },
    ];
  });

  async execAction(action: VmRowClickedEvent<Folder>): Promise<void> {
    if (action.key === 'edit') {
      if (!action.rowData) {
        return;
      }

      const folderWithSheets = await firstValueFrom(
        this.#folderService.loadByIdWithSheets$(action.rowData.musicFolderId),
      );
      const reload = await this.#folderDataDialogService.openEditFolderDialog(folderWithSheets);
      if (reload) {
        this.#reload.next(true);
      }
      return;
    }

    if (action.key === 'delete') {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const reload = await this.#folderDataDialogService.openDeleteFolderDialog(action.rowData!);
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

  column: VmColumn<Folder>[] = [
    { key: 'name', header: 'Name', field: 'name', filterable: true },
    { key: 'groupId', header: 'Gruppe', field: 'groupId', type: 'template', filterable: true },
    { key: 'membercount', header: 'Anzahl der Stücke', field: 'membercount' },
    { key: 'updatedAt', header: 'Bearbeiten am', field: 'updatedAt', type: 'date-time' },
    { key: 'updatedBy', header: 'Bearbeitet von', field: 'updatedBy' },
  ];

  filterInputChanged(term: string | number | string[] | number[] | null | undefined): void {
    const normalized = Array.isArray(term) ? (term[0] ?? '') : (term ?? '');
    this.#filterTerm$.next(normalized.toString());
  }
}
